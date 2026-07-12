'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, User, ChevronLeft, Search } from 'lucide-react'
import { studentApi } from '@/services/student-api'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedUser, setSelectedUser] = useState('admin')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    studentApi.get<any[]>('/messages').then((d) => {
      setMessages(d || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      const payload = {
        sender_type: 'student',
        sender_id: selectedUser === 'admin' ? 1 : 0,
        receiver_type: 'admin',
        receiver_id: 1,
        message: newMessage.trim(),
        subject: 'رسالة من الطالب',
      }
      const res = await studentApi.post<any>('/messages', payload)
      setMessages((prev) => [...prev, { ...payload, id: res.id || Date.now(), created_at: new Date().toISOString() }])
      setNewMessage('')
    } catch {}
    setSending(false)
  }

  const contacts = [
    { id: 'admin', name: 'الإدارة', role: 'شؤون الطلاب', icon: User },
    { id: 'advisor', name: 'المرشد الأكاديمي', role: 'إرشاد', icon: User },
  ]

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)]">
      <h1 className="text-2xl font-bold mb-4">الرسائل</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
        <div className="w-64 border-l border-gray-100 p-3 hidden sm:block">
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="w-full h-9 pr-9 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="بحث..." />
          </div>
          {contacts.map((c) => (
            <button key={c.id} onClick={() => setSelectedUser(c.id)}
              className={`w-full p-3 rounded-xl text-right flex items-center gap-3 transition-colors ${
                selectedUser === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <c.icon className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.role}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-gray-100 flex items-center gap-3 sm:hidden">
            <button className="p-1"><ChevronLeft className="h-5 w-5 text-gray-400" /></button>
            <p className="font-medium text-sm">{contacts.find((c) => c.id === selectedUser)?.name}</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">لا توجد رسائل بعد</p>
                <p className="text-gray-300 text-xs">أرسل رسالة لبدء المحادثة</p>
              </div>
            ) : (
              messages.map((m) => {
                const isStudent = m.sender_type === 'student'
                return (
                  <div key={m.id} className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      isStudent ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      <p>{m.message || m.body}</p>
                      <p className={`text-[10px] mt-1 ${isStudent ? 'text-white/60' : 'text-gray-400'}`}>
                        {m.created_at ? new Date(m.created_at).toLocaleString('ar-EG') : ''}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-10 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="اكتب رسالتك..."
              />
              <button onClick={handleSend} disabled={sending || !newMessage.trim()}
                className="w-10 h-10 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
