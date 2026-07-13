'use client'

import { useState } from 'react'
import { UserAvatar } from './user-avatar'
import type { ChatMessage } from '@/types/chat'
import { Check, CheckCheck, Reply, MoreVertical, Pin, Star, Pencil, Trash2, Copy, Forward } from 'lucide-react'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar?: boolean
  onReply?: (msg: ChatMessage) => void
  onEdit?: (msg: ChatMessage) => void
  onDelete?: (msg: ChatMessage) => void
  onPin?: (msg: ChatMessage) => void
  onStar?: (msg: ChatMessage) => void
}

export function MessageBubble({ message, isOwn, showAvatar = true, onReply, onEdit, onDelete, onPin, onStar }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
        <div className="px-4 py-2 rounded-2xl bg-muted/50 text-muted-foreground text-sm italic">
          تم حذف هذه الرسالة
        </div>
      </div>
    )
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4 group`} onMouseLeave={() => setShowMenu(false)}>
      {!isOwn && showAvatar && (
        <UserAvatar src={message.file_path} name={message.full_name || 'User'} size="sm" className="mt-auto mb-1 ml-2" />
      )}
      {!isOwn && !showAvatar && <div className="w-10" />}

      <div className={`relative max-w-[70%] min-w-[80px] ${isOwn ? 'order-1' : 'order-2'}`}>
        {/* Reply reference */}
        {message.reply_to_id && message.reply_to_text && (
          <div className={`px-3 py-1.5 rounded-t-2xl border-b text-xs ${isOwn ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border'}`}>
            <div className="flex items-center gap-1 text-primary font-medium">
              <Reply className="w-3 h-3" />
              {message.reply_to_sender}
            </div>
            <p className="text-muted-foreground truncate mt-0.5">{message.reply_to_text}</p>
          </div>
        )}

        {/* Message bubble */}
        <div className={`relative px-3 py-2 ${
          isOwn
            ? `rounded-2xl ${message.reply_to_id ? 'rounded-tr-none' : ''} bg-primary text-primary-foreground`
            : `rounded-2xl ${message.reply_to_id ? 'rounded-tr-none' : ''} bg-card text-foreground border border-border`
        }`}>
          {/* Group sender name */}
          {!isOwn && message.group_id && (
            <p className="text-[11px] font-bold text-primary mb-0.5">{message.full_name}</p>
          )}

          {/* Message content */}
          {message.message_type === 'audio' && message.attachment_url ? (
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎤</span>
                <span className="text-xs opacity-70">رسالة صوتية</span>
              </div>
              <audio controls src={message.attachment_url} className="w-full h-8" style={{ filter: isOwn ? 'invert(1) hue-rotate(180deg)' : 'none' }} />
              {message.attachment_size && (
                <p className="text-[10px] opacity-50 mt-0.5">{formatFileSize(message.attachment_size)}</p>
              )}
            </div>
          ) : message.message_type === 'image' && message.attachment_url ? (
            <div className="rounded-xl overflow-hidden max-w-[280px]">
              <img src={message.attachment_url} alt="" className="w-full h-auto" loading="lazy" />
            </div>
          ) : message.attachment_url ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-lg">📎</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.attachment_name || 'ملف مرفق'}</p>
                {message.attachment_size && (
                  <p className="text-[11px] opacity-70">{formatFileSize(message.attachment_size)}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message_text}</p>
          )}

          {/* Time + status */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {message.is_pinned && <Pin className="w-3 h-3" />}
            {message.is_starred && <Star className="w-3 h-3 fill-current" />}
            {message.is_edited && <span className="text-[10px]">تعديل</span>}
            <span className="text-[10px]">{formatTime(message.created_at)}</span>
            {isOwn && (
              (message as any)._pending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
              ) : message.is_read ? (
                <CheckCheck className="w-4 h-4 text-blue-400" />
              ) : (
                <Check className="w-4 h-4" />
              )
            )}
          </div>
        </div>

        {/* Action menu */}
        <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full -ml-1' : 'right-0 translate-x-full mr-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="flex items-center gap-0.5 bg-card border border-border rounded-xl shadow-lg p-0.5">
            <button onClick={() => onReply?.(message)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="رد">
              <Reply className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="المزيد">
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showMenu && (
                <div className="absolute top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[140px] z-50">
                  <button onClick={() => { navigator.clipboard.writeText(message.message_text); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <Copy className="w-4 h-4" /> نسخ
                  </button>
                  {isOwn && (
                    <button onClick={() => { onEdit?.(message); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                      <Pencil className="w-4 h-4" /> تعديل
                    </button>
                  )}
                  <button onClick={() => { onPin?.(message); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <Pin className="w-4 h-4" /> {message.is_pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                  </button>
                  <button onClick={() => { onStar?.(message); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                    <Star className="w-4 h-4" /> {message.is_starred ? 'إزالة النجمة' : 'تمييز بنجمة'}
                  </button>
                  {isOwn && (
                    <button onClick={() => { onDelete?.(message); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
