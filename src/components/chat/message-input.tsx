'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'
import { Send, Paperclip, Smile, X, Reply, Mic, Square, Image, FileText } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string, replyToId?: number) => void
  onSendFile?: (file: File) => void
  onSendVoice?: (blob: Blob) => void
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, onSendFile, onSendVoice, replyTo, onCancelReply, disabled, placeholder = 'اكتب رسالة...' }: MessageInputProps) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewFile, setPreviewFile] = useState<{ file: File; preview?: string } | null>(null)
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '👏', '😍', '🤔', '😢', '😎', '🙏', '💪', '✨', '📌', '📚', '🎓', '🏫', '✅', '❌', '⏰', '📋', '💡', '🌟']

  useEffect(() => {
    if (replyTo && inputRef.current) inputRef.current.focus()
  }, [replyTo])

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (previewFile?.preview) URL.revokeObjectURL(previewFile.preview)
    }
  }, [previewFile])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    setIsSending(true)
    try {
      await onSend(trimmed, replyTo?.id)
    } finally {
      setText('')
      setIsSending(false)
      inputRef.current?.focus()
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    setPreviewFile({ file, preview })
    e.target.value = ''
  }

  const handleSendFile = async () => {
    if (!previewFile || !onSendFile) return
    const file = previewFile.file
    setPreviewFile(null)
    await onSendFile(file)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        if (onSendVoice && blob.size > 0) {
          onSendVoice(blob)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch {
      alert('لا يمكن الوصول إلى الميكروفون')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onstop = null
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
      setIsRecording(false)
      setRecordingTime(0)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
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

      {/* File preview */}
      {previewFile && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-primary/10">
          {previewFile.preview ? (
            <img src={previewFile.preview} alt="" className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{previewFile.file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {(previewFile.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button onClick={() => setPreviewFile(null)} className="p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleSendFile}
            className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <Send className="w-4 h-4 inline ml-1" /> إرسال
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-2 bg-danger/5 border-b border-danger/10">
          <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
          <span className="text-sm text-danger font-medium">تسجيل... {formatTime(recordingTime)}</span>
          <div className="flex-1" />
          <button onClick={cancelRecording} className="px-3 py-1 rounded-xl text-sm text-muted-foreground hover:bg-muted">
            إلغاء
          </button>
          <button
            onClick={stopRecording}
            className="px-4 py-1.5 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 flex items-center gap-1"
          >
            <Square className="w-3.5 h-3.5" /> إيقاف
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {emojis.map(emoji => (
              <button key={emoji} onClick={() => insertEmoji(emoji)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg">
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt" onChange={handleFileSelect} />
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            title="إرفاق ملف"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            title="صورة أو فيديو"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isRecording}
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

        {text.trim() ? (
          <button
            onClick={handleSend}
            disabled={isSending}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all disabled:opacity-50"
            title="إرسال"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-xl transition-all ${
              isRecording
                ? 'bg-danger text-white animate-pulse shadow-md shadow-danger/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
