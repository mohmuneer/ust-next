'use client'

import { useState, useEffect, useCallback } from 'react'
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

  // Polling interval for real-time feel
  const POLL_INTERVAL = 4000

  // Fetch conversations with polling
  const { data: conversations = [] } = useQuery({
    queryKey: ['chat', 'conversations', currentUserId],
    queryFn: () => chatService.getConversations(currentUserId),
    refetchInterval: POLL_INTERVAL,
  })

  // Fetch messages when conversation is selected
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', 'messages', selectedConvo?.type, selectedConvo?.id],
    queryFn: () => {
      if (!selectedConvo) return Promise.resolve([])
      if (selectedConvo.type === 'group') {
        return chatService.getGroupMessages(selectedConvo.id)
      }
      return chatService.getMessages(selectedConvo.id)
    },
    enabled: !!selectedConvo,
    refetchInterval: POLL_INTERVAL,
  })

  // Fetch group members if group is selected
  const { data: groupMembers = [] } = useQuery({
    queryKey: ['chat', 'group-members', selectedConvo?.id],
    queryFn: () => chatService.getGroupMembers(selectedConvo!.id),
    enabled: !!selectedConvo && selectedConvo.type === 'group',
  })

  // Unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['chat', 'unread', currentUserId],
    queryFn: () => chatService.getUnreadCount(currentUserId),
    refetchInterval: POLL_INTERVAL,
  })

  // Update presence on mount
  useEffect(() => {
    chatService.updatePresence(currentUserId, true)
    const interval = setInterval(() => {
      chatService.updatePresence(currentUserId, true)
    }, 30000)
    return () => {
      chatService.updatePresence(currentUserId, false)
      clearInterval(interval)
    }
  }, [currentUserId])

  // Handle send message
  const handleSend = useCallback(async (text: string, replyToId?: number) => {
    if (!selectedConvo) return
    const data: any = {
      sender_id: currentUserId,
      message_text: text,
      message_type: 'text',
    }
    if (selectedConvo.type === 'group') {
      data.group_id = selectedConvo.id
    } else {
      data.receiver_id = selectedConvo.id
    }
    if (replyToId) data.reply_to_id = replyToId

    await chatService.sendMessage(data)
    queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] })
    queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
  }, [selectedConvo, currentUserId, queryClient])

  // Handle conversation select
  const handleSelectConversation = useCallback(async (id: number, type: 'direct' | 'group') => {
    const convo = conversations.find(c => c.id === id && c.type === type) || null
    setSelectedConvo(convo)
    setMobileView('chat')

    // Mark as read
    if (convo) {
      if (type === 'group') {
        await chatService.markGroupAsRead(id, currentUserId)
      } else {
        await chatService.markAsRead(id, currentUserId)
      }
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] })
    }
  }, [conversations, currentUserId, queryClient])

  // Handle actions
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

  const handleBack = () => {
    setMobileView('list')
    setSelectedConvo(null)
  }

  return (
    <div className="h-[calc(100vh-var(--header-height,64px))] flex bg-background overflow-hidden" style={{ margin: '-1.5rem', marginTop: 0 }}>
      {/* Sidebar */}
      <div className={`w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 border-l border-border ${
        mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
      } flex-col`}>
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConvo?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={() => setShowNewChat(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          currentUserId={currentUserId}
        />
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        mobileView === 'list' ? 'hidden lg:flex' : 'flex'
      }`}>
        <ChatWindow
          conversation={selectedConvo}
          messages={messages}
          currentUserId={currentUserId}
          onSend={handleSend}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onPin={handlePin}
          onStar={handleStar}
          onToggleInfo={() => setShowInfo(!showInfo)}
          onBack={handleBack}
          isLoading={messagesLoading}
        />
      </div>

      {/* Info Panel */}
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

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        currentUserId={currentUserId}
        onSelectUser={(userId) => handleSelectConversation(userId, 'direct')}
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
