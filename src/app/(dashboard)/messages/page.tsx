'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { ChatWindow } from '@/components/chat/chat-window'
import { InfoPanel } from '@/components/chat/info-panel'
import { CreateGroupModal } from '@/components/chat/create-group-modal'
import { NewChatModal } from '@/components/chat/new-chat-modal'
import type { Conversation, ChatMessage, GroupMember } from '@/types/chat'
import { useAuthStore } from '@/store/useAuthStore'
import { useEmployeeAuthStore } from '@/store/useEmployeeAuthStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

function generateClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export default function ChatPage() {
  const queryClient = useQueryClient()
  const authUser = useAuthStore(s => s.user)
  const empUser = useEmployeeAuthStore(s => s.employee)
  const studentUser = useStudentAuthStore(s => s.student)
  const currentUserId = authUser?.id || empUser?.id || studentUser?.id || 10
  const currentUserName = authUser?.full_name || empUser?.full_name || studentUser?.full_name || 'مستخدم'

  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [sending, setSending] = useState(false)
  const sentIdsRef = useRef<Set<string>>(new Set())

  const POLL_INTERVAL = 4000

  const { data: conversations = [] } = useQuery({
    queryKey: ['chat', 'conversations', currentUserId],
    queryFn: () => chatService.getConversations(currentUserId),
    refetchInterval: POLL_INTERVAL,
  })

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
    queryFn: () => {
      if (!selectedConvo) return Promise.resolve([])
      if (selectedConvo.type === 'group') return chatService.getGroupMessages(selectedConvo.id)
      return chatService.getMessages(selectedConvo.id)
    },
    enabled: !!selectedConvo,
    refetchInterval: POLL_INTERVAL,
  })

  const { data: groupMembers = [] } = useQuery({
    queryKey: ['chat', 'group-members', selectedConvo?.id],
    queryFn: () => chatService.getGroupMembers(selectedConvo!.id),
    enabled: !!selectedConvo && selectedConvo.type === 'group',
  })

  useEffect(() => {
    chatService.updatePresence(currentUserId, true)
    const interval = setInterval(() => chatService.updatePresence(currentUserId, true), 30000)
    return () => { chatService.updatePresence(currentUserId, false); clearInterval(interval) }
  }, [currentUserId])

  const addOptimisticMessage = useCallback((clientId: string, text: string, msgType: string, extra: Record<string, unknown> = {}) => {
    const optimisticMsg: ChatMessage = {
      id: -Date.now(),
      client_message_id: clientId,
      sender_id: currentUserId,
      receiver_id: selectedConvo?.type === 'direct' ? selectedConvo.id : null,
      group_id: selectedConvo?.type === 'group' ? selectedConvo.id : null,
      message_text: text,
      message_type: msgType as ChatMessage['message_type'],
      is_read: 0,
      created_at: new Date().toISOString(),
      full_name: currentUserName,
      _pending: true,
      ...extra,
    }
    queryClient.setQueryData<ChatMessage[]>(
      ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
      (old = []) => [...old, optimisticMsg]
    )
    return optimisticMsg
  }, [currentUserId, currentUserName, selectedConvo, queryClient])

  const reconcileMessage = useCallback((clientId: string, serverMsg: ChatMessage | null) => {
    if (!serverMsg) return
    queryClient.setQueryData<ChatMessage[]>(
      ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
      (old = []) => old.map(m => m.client_message_id === clientId ? { ...serverMsg, _pending: false } : m)
    )
  }, [selectedConvo, queryClient])

  const handleSend = useCallback(async (text: string, replyToId?: number) => {
    if (!selectedConvo || sending) return
    const clientId = generateClientId()
    if (sentIdsRef.current.has(clientId)) return
    sentIdsRef.current.add(clientId)
    setSending(true)

    addOptimisticMessage(clientId, text, 'text', replyToId ? { reply_to_id: replyToId } : {})

    try {
      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: text,
        message_type: 'text',
        client_message_id: clientId,
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id
      if (replyToId) data.reply_to_id = replyToId

      const result = await chatService.sendMessage(data as any)
      reconcileMessage(clientId, result)
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } catch {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
        (old = []) => old.map(m => m.client_message_id === clientId ? { ...m, _pending: false } : m)
      )
    } finally {
      setSending(false)
      sentIdsRef.current.delete(clientId)
    }
  }, [selectedConvo, currentUserId, sending, queryClient, addOptimisticMessage, reconcileMessage])

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleSendFile = useCallback(async (file: File) => {
    if (!selectedConvo || sending) return
    const clientId = generateClientId()
    setSending(true)

    const isImage = file.type.startsWith('image/')
    const msgType = isImage ? 'image' : 'file'
    addOptimisticMessage(clientId, file.name, msgType, {
      attachment_name: file.name,
      attachment_type: file.type,
      attachment_size: file.size,
    })

    try {
      const base64 = await fileToBase64(file)
      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: file.name,
        message_type: msgType,
        attachment_url: base64,
        attachment_name: file.name,
        attachment_type: file.type,
        attachment_size: file.size,
        client_message_id: clientId,
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id

      const result = await chatService.sendMessage(data as any)
      reconcileMessage(clientId, result)
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } catch {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
        (old = []) => old.map(m => m.client_message_id === clientId ? { ...m, _pending: false } : m)
      )
    } finally {
      setSending(false)
    }
  }, [selectedConvo, currentUserId, sending, queryClient, addOptimisticMessage, reconcileMessage])

  const handleSendVoice = useCallback(async (blob: Blob, duration: number) => {
    if (!selectedConvo || sending) return
    const clientId = generateClientId()
    setSending(true)

    addOptimisticMessage(clientId, 'رسالة صوتية', 'audio', {
      attachment_name: `voice-${Date.now()}.webm`,
      attachment_type: blob.type || 'audio/webm',
      attachment_size: blob.size,
    })

    try {
      const base64 = await fileToBase64(blob as File)
      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: 'رسالة صوتية',
        message_type: 'audio',
        attachment_url: base64,
        attachment_name: `voice-${Date.now()}.webm`,
        attachment_type: blob.type || 'audio/webm',
        attachment_size: blob.size,
        client_message_id: clientId,
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id

      const result = await chatService.sendMessage(data as any)
      reconcileMessage(clientId, result)
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } catch {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
        (old = []) => old.map(m => m.client_message_id === clientId ? { ...m, _pending: false } : m)
      )
    } finally {
      setSending(false)
    }
  }, [selectedConvo, currentUserId, sending, queryClient, addOptimisticMessage, reconcileMessage])

  const handleSelectConversation = useCallback((id: number, type: 'direct' | 'group') => {
    const convo = conversations.find(c => c.id === id && c.type === type) || null
    if (convo) {
      setSelectedConvo(convo)
    } else if (type === 'direct') {
      const synthetic: Conversation = {
        id,
        type: 'direct',
        full_name: `مستخدم ${id}`,
        last_message: '',
        created_at: new Date().toISOString(),
        is_read: true,
        unread_count: 0,
      }
      setSelectedConvo(synthetic)
    }
    setMobileView('chat')
    chatService.markAsRead(id, currentUserId).catch(() => {})
    queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] })
  }, [conversations, currentUserId, queryClient])

  const handleSelectFromSearch = useCallback((userId: number, userName?: string, userRole?: string, userAvatar?: string) => {
    const convo = conversations.find(c => c.id === userId && c.type === 'direct') || null
    if (convo) {
      setSelectedConvo(convo)
    } else {
      const synthetic: Conversation = {
        id: userId,
        type: 'direct',
        full_name: userName || `مستخدم ${userId}`,
        file_path: userAvatar || undefined,
        last_message: '',
        created_at: new Date().toISOString(),
        is_read: true,
        unread_count: 0,
        role: userRole,
      }
      setSelectedConvo(synthetic)
    }
    setMobileView('chat')
    queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] })
  }, [conversations, queryClient])

  const handleDelete = useCallback(async (msg: ChatMessage) => {
    if (confirm('هل تريد حذف هذه الرسالة؟')) {
      await chatService.deleteMessage(msg.id)
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
    }
  }, [queryClient])

  const handlePin = useCallback(async (msg: ChatMessage) => {
    await chatService.pinMessage(msg.id, !msg.is_pinned)
    queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
  }, [queryClient])

  const handleStar = useCallback(async (msg: ChatMessage) => {
    await chatService.starMessage(msg.id, !msg.is_starred)
    queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
  }, [queryClient])

  const handleEdit = useCallback(async (msg: ChatMessage) => {
    const newText = prompt('تعديل الرسالة:', msg.message_text)
    if (newText && newText !== msg.message_text) {
      await chatService.editMessage(msg.id, newText)
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
    }
  }, [queryClient])

  const handleBack = () => { setMobileView('list'); setSelectedConvo(null) }

  return (
    <div className="h-[calc(100vh-var(--header-height,64px))] flex bg-background overflow-hidden" style={{ margin: '-1.5rem', marginTop: 0 }}>
      <div className={`w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 border-l border-border ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'} flex-col`}>
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConvo?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={() => setShowNewChat(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          currentUserId={currentUserId}
        />
      </div>

      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
        <ChatWindow
          conversation={selectedConvo}
          messages={messages}
          currentUserId={currentUserId}
          onSend={handleSend}
          onSendFile={handleSendFile}
          onSendVoice={handleSendVoice}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onPin={handlePin}
          onStar={handleStar}
          onToggleInfo={() => setShowInfo(!showInfo)}
          onBack={handleBack}
          isLoading={messagesLoading}
          sending={sending}
        />
      </div>

      {showInfo && selectedConvo && (
        <div className="hidden xl:flex">
          <InfoPanel
            conversation={selectedConvo}
            messages={messages}
            groupMembers={selectedConvo.type === 'group' ? groupMembers : undefined}
            onClose={() => setShowInfo(false)}
          />
        </div>
      )}

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        currentUserId={currentUserId}
        onSelectUser={(userId, name, role, avatar) => handleSelectFromSearch(userId, name, role, avatar)}
      />
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        currentUserId={currentUserId}
        onGroupCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
          queryClient.invalidateQueries({ queryKey: ['chat', 'groups'] })
        }}
      />
    </div>
  )
}
