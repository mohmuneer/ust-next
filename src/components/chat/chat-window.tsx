'use client'

import { useState, useRef, useEffect } from 'react'
import { UserAvatar } from './user-avatar'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import type { ChatMessage, Conversation } from '@/types/chat'
import { Phone, Video, Search, Info, ArrowRight, Users, MoreVertical } from 'lucide-react'

interface ChatWindowProps {
  conversation: Conversation | null
  messages: ChatMessage[]
  currentUserId: number
  onSend: (text: string, replyToId?: number) => void
  onDelete: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onPin: (msg: ChatMessage) => void
  onStar: (msg: ChatMessage) => void
  onToggleInfo: () => void
  onBack: () => void
  isLoading?: boolean
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSend,
  onDelete,
  onEdit,
  onPin,
  onStar,
  onToggleInfo,
  onBack,
  isLoading,
}: ChatWindowProps) {
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredMessages = searchQuery
    ? messages.filter(m => m.message_text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const shouldShowDateSeparator = (msg: ChatMessage, prevMsg?: ChatMessage) => {
    if (!prevMsg) return true
    const d1 = new Date(msg.created_at).toDateString()
    const d2 = new Date(prevMsg.created_at).toDateString()
    return d1 !== d2
  }

  const shouldShowAvatar = (msg: ChatMessage, idx: number) => {
    if (idx === messages.length - 1) return true
    const next = messages[idx + 1]
    return next?.sender_id !== msg.sender_id
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">مرحباً بك في الشات الجامعي</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل مع زملائك
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden p-2 rounded-xl hover:bg-muted">
            <ArrowRight className="w-5 h-5" />
          </button>
          <UserAvatar
            src={conversation.file_path}
            name={conversation.full_name}
            size="md"
            isOnline={conversation.type === 'direct' ? conversation.is_online : undefined}
          />
          <div>
            <h3 className="text-sm font-bold text-foreground">{conversation.full_name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {conversation.type === 'group'
                ? `${conversation.member_count || 0} عضو`
                : conversation.is_online ? 'متصل الآن' : 'غير متصل'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Search className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex" title="اتصال صوتي">
            <Phone className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex" title="مكالمة فيديو">
            <Video className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <button onClick={onToggleInfo} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Info className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في الرسائل..."
              className="w-full pr-9 pl-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-4" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(var(--color-primary-rgb, 3, 142, 211)) 0%, transparent 50%)',
        backgroundSize: '200% 200%',
        backgroundPosition: '100% 0%',
        opacity: 1,
      }}>
        <div className="max-w-3xl mx-auto space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {searchQuery ? 'لا توجد رسائل مطابقة' : 'لا توجد رسائل بعد'}
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isOwn = msg.sender_id === currentUserId
              const showDate = shouldShowDateSeparator(msg, filteredMessages[idx - 1])
              const showAv = shouldShowAvatar(msg, idx)
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-card border border-border text-[11px] text-muted-foreground font-medium shadow-sm">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={isOwn}
                    showAvatar={showAv}
                    onReply={setReplyTo}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPin={onPin}
                    onStar={onStar}
                  />
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}
