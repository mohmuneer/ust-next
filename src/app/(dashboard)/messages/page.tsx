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
import apiClient from '@/lib/axios'

export default function ChatPage() {
  const queryClient = useQueryClient()
  const authUser = useAuthStore(s => s.user)
  const empUser = useEmployeeAuthStore(s => s.employee)
  const studentUser = useStudentAuthStore(s => s.student)
  const currentUserId = authUser?.id || empUser?.id || studentUser?.id || 10

  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const sendingRef = useRef(false)

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

  const handleSend = useCallback(async (text: string, replyToId?: number) => {
    if (!selectedConvo || sendingRef.current) return
    sendingRef.current = true
    try {
      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: text,
        message_type: 'text',
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id
      if (replyToId) data.reply_to_id = replyToId

      await chatService.sendMessage(data as any)
      await queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedConvo.type, selectedConvo.id] })
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } finally {
      sendingRef.current = false
    }
  }, [selectedConvo, currentUserId, queryClient])

  const handleSendFile = useCallback(async (file: File) => {
    if (!selectedConvo || sendingRef.current) return
    sendingRef.current = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await apiClient.post<{ url: string; name: string; type: string; size: number }>('/upload', formData)
      const fileData = uploadRes.data

      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: fileData.name,
        message_type: file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? 'image' : 'file',
        attachment_url: fileData.url,
        attachment_name: fileData.name,
        attachment_type: fileData.type,
        attachment_size: fileData.size,
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id

      await chatService.sendMessage(data as any)
      await queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedConvo.type, selectedConvo.id] })
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } catch {
      alert('فشل رفع الملف')
    } finally {
      sendingRef.current = false
    }
  }, [selectedConvo, currentUserId, queryClient])

  const handleSendVoice = useCallback(async (blob: Blob) => {
    if (!selectedConvo || sendingRef.current) return
    sendingRef.current = true
    try {
      const formData = new FormData()
      const ext = blob.type.includes('webm') ? 'webm' : 'mp3'
      const fileName = `voice-${Date.now()}.${ext}`
      formData.append('file', blob, fileName)
      const uploadRes = await apiClient.post<{ url: string; name: string; type: string; size: number }>('/upload', formData)
      const fileData = uploadRes.data

      const data: Record<string, unknown> = {
        sender_id: currentUserId,
        message_text: ' رسالة صوتية',
        message_type: 'audio',
        attachment_url: fileData.url,
        attachment_name: fileName,
        attachment_type: 'audio/webm',
        attachment_size: blob.size,
      }
      if (selectedConvo.type === 'group') data.group_id = selectedConvo.id
      else data.receiver_id = selectedConvo.id

      await chatService.sendMessage(data as any)
      await queryClient.invalidateQueries({ queryKey: ['chat', 'messages', selectedConvo.type, selectedConvo.id] })
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    } catch {
      alert('فشل رفع التسجيل')
    } finally {
      sendingRef.current = false
    }
  }, [selectedConvo, currentUserId, queryClient])

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
