'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Bell, Calendar, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { getImageUrl } from '@/lib/utils'

const CATEGORIES: Record<string, { label: string; color: string; icon: any }> = {
  announcement: { label: 'إعلان', color: 'bg-blue-100 text-blue-700', icon: Megaphone },
  news: { label: 'أخبار', color: 'bg-green-100 text-green-700', icon: Bell },
  event: { label: 'فعالية', color: 'bg-purple-100 text-purple-700', icon: Calendar },
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    studentApi.get<any[]>('/student-announcements').then((data) => {
      setAnnouncements(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filtered = announcements.filter((a) => !search || a.title?.includes(search) || a.summary?.includes(search))

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإعلانات</h1>
        <p className="text-gray-500 text-sm">آخر الأخبار والإعلانات</p>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في الإعلانات..."
          className="w-full h-11 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد إعلانات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const cat = CATEGORIES[a.category] || CATEGORIES.announcement
            const isOpen = expanded.has(a.id)
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {a.image && (
                  <img src={getImageUrl(a.image)} alt={a.title} className="w-full h-48 object-cover" />
                )}
                <button onClick={() => toggle(a.id)} className="w-full p-4 text-right">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0">
                      <cat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-sm">{a.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>
                      {a.summary && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.summary}</p>}
                      <p className="text-[10px] text-gray-400 mt-2">{a.published_at ? new Date(a.published_at).toLocaleDateString('ar-EG') : ''}</p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                  </div>
                </button>
                {isOpen && a.content && (
                  <div className="px-4 pb-4 mx-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">{a.content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
