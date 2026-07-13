'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'
import { Send, Paperclip, Smile, X, Reply, Image, FileText, Mic } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string, replyToId?: number) => void
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, replyTo, onCancelReply, disabled, placeholder = 'اكتب رسالة...' }: MessageInputProps) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '👏', '😍', '🤔', '😢', '😎', '🙏', '💪', '✨', '📌', '📚', '🎓', '🏫', '✅', '❌', '⏰', '📋', '💡', '🌟']

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyTo])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed, replyTo?.id)
    setText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t border-border bg-card">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/10">
          <Reply className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary">{replyTo.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{replyTo.message_text}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2 rounded-xl transition-colors ${showEmoji ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
            title="إيموجي"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors" title="مرفق">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl bg-muted border-0 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32 min-h-[40px]"
            style={{ height: 'auto', minHeight: '40px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 128) + 'px'
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={`p-2.5 rounded-xl transition-all ${
            text.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          title="إرسال"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
