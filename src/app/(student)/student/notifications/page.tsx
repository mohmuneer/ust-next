'use client'

import { useState, useEffect } from 'react'
import { Bell, Calendar, Info, AlertTriangle, CheckCircle2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { studentApi } from '@/services/student-api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    studentApi.get<any[]>('/notifications').then((d) => {
      setNotifications((d || []).sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    // Mark as read
    studentApi.put<any>(`/notifications/${id}`, { is_read: true }).catch(() => {})
  }

  const getIcon = (type?: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5 text-primary" />
    }
  }

  const getBg = (type?: string) => {
    switch (type) {
      case 'warning': return 'from-amber-50 to-orange-50'
      case 'success': return 'from-green-50 to-emerald-50'
      case 'info': return 'from-blue-50 to-indigo-50'
      default: return 'from-gray-50 to-white'
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-gray-500 text-sm">آخر الإشعارات والتنبيهات</p>
        </div>
        {unread > 0 && (
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-medium">
            {unread} غير مقروء
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const open = expanded.has(n.id)
            return (
              <div key={n.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all ${
                  !n.is_read ? 'ring-1 ring-primary/20' : ''
                }`}
              >
                <button onClick={() => toggle(n.id)} className="w-full p-4 flex items-start gap-4 text-right">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getBg(n.type)} flex items-center justify-center shrink-0`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.title || 'إشعار'}
                      </p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{open ? '' : (n.message || n.body || '')}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Calendar className="h-3 w-3 text-gray-300" />
                      <span className="text-[10px] text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG') : '---'}</span>
                    </div>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-gray-300 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-300 shrink-0" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-gray-100 mx-4 pt-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{n.message || n.body || 'لا توجد تفاصيل'}</p>
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
