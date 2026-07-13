'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'
import { Send, Paperclip, Smile, X, Reply, Mic, Square, Image, FileText, Play } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string, replyToId?: number) => void
  onSendFile?: (file: File) => void
  onSendVoice?: (blob: Blob, duration: number) => void
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  disabled?: boolean
  sending?: boolean
  placeholder?: string
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  if (typeof MediaRecorder === 'undefined') return ''
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export function MessageInput({ onSend, onSendFile, onSendVoice, replyTo, onCancelReply, disabled, sending, placeholder = 'اكتب رسالة...' }: MessageInputProps) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [previewFile, setPreviewFile] = useState<{ file: File; preview?: string } | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedDuration, setRecordedDuration] = useState(0)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const recordStartTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '👏', '😍', '🤔', '😢', '😎', '🙏', '💪', '✨', '📌', '📚', '🎓', '🏫', '✅', '❌', '⏰', '📋', '💡', '🌟']

  useEffect(() => {
    if (replyTo && inputRef.current) inputRef.current.focus()
  }, [replyTo])

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (previewFile?.preview) URL.revokeObjectURL(previewFile.preview)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current = null
      }
    }
  }, [previewFile])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    try {
      await onSend(trimmed, replyTo?.id)
    } finally {
      setText('')
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
    setRecordingError(null)
    setRecordedBlob(null)
    setIsPreviewing(false)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordingError('متصفحك لا يدعم تسجيل الصوت. يرجى استخدام Chrome أو Edge')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getSupportedMimeType()
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const type = mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null

        if (blob.size > 0) {
          const duration = Math.round((Date.now() - recordStartTimeRef.current - pausedTimeRef.current) / 1000)
          setRecordedBlob(blob)
          setRecordedDuration(Math.max(duration, 1))
          setIsPreviewing(true)
        }
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }

      mediaRecorder.onerror = () => {
        setRecordingError('حدث خطأ أثناء التسجيل')
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }

      mediaRecorder.start(250)
      recordStartTimeRef.current = Date.now()
      pausedTimeRef.current = 0
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - recordStartTimeRef.current - pausedTimeRef.current) / 1000)
        setRecordingTime(elapsed)
      }, 200)
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setRecordingError('تم رفض إذن الميكروفون. يرجى السماح بالوصول من إعدادات المتصفح')
      } else if (err.name === 'NotFoundError') {
        setRecordingError('لم يتم العثور على ميكروفون')
      } else {
        setRecordingError('لا يمكن الوصول إلى الميكروفون')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.ondataavailable = null
        mediaRecorderRef.current.onstop = null
        mediaRecorderRef.current.onerror = null
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setRecordedBlob(null)
    setIsPreviewing(false)
    setRecordingError(null)
  }

  const playPreview = () => {
    if (!recordedBlob) return
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }
    const url = URL.createObjectURL(recordedBlob)
    const audio = new Audio(url)
    previewAudioRef.current = audio
    audio.play()
    audio.onended = () => {
      URL.revokeObjectURL(url)
    }
  }

  const sendRecording = async () => {
    if (!recordedBlob || !onSendVoice) return
    const blob = recordedBlob
    setRecordedBlob(null)
    setIsPreviewing(false)
    setRecordingTime(0)
    await onSendVoice(blob, recordedDuration)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const hasText = text.trim().length > 0

  return (
    <div className="border-t border-border bg-card">
      {recordingError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-danger/10 border-b border-danger/20">
          <span className="text-sm text-danger">{recordingError}</span>
          <button onClick={() => setRecordingError(null)} className="mr-auto p-1 rounded-lg hover:bg-danger/20">
            <X className="w-4 h-4 text-danger" />
          </button>
        </div>
      )}

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
            disabled={sending}
            className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-4 h-4 inline ml-1" /> إرسال
          </button>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-3 bg-danger/5 border-b border-danger/10">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
            <span className="text-sm text-danger font-mono font-bold">
              {formatTime(recordingTime)}
            </span>
            <div className="flex-1 flex items-center gap-0.5 px-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-danger/40 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    animationDelay: `${i * 50}ms`,
                    opacity: i < recordingTime % 30 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={cancelRecording}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={stopRecording}
            className="p-2 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors"
            title="إيقاف التسجيل"
          >
            <Square className="w-5 h-5" />
          </button>
        </div>
      )}

      {isPreviewing && recordedBlob && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-primary/10">
          <button
            onClick={playPreview}
            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Play className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-0.5">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-primary/30 rounded-full"
                style={{ height: `${Math.random() * 14 + 4}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-mono">{formatTime(recordedDuration)}</span>
          <button
            onClick={cancelRecording}
            className="px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 inline" /> حذف
          </button>
          <button
            onClick={sendRecording}
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-md shadow-primary/25 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> إرسال
          </button>
        </div>
      )}

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

      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt" onChange={handleFileSelect} />
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

      {!isRecording && !isPreviewing && (
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
              disabled={disabled || sending}
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

          {hasText ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="إرسال"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={sending}
              className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all disabled:opacity-50"
              title="تسجيل صوتي"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
