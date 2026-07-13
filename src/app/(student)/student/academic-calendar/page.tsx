'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

const EVENT_TYPES: Record<string, { label: string; color: string; icon: any }> = {
  exam: { label: 'اختبار', color: 'from-red-500 to-rose-600', icon: AlertTriangle },
  holiday: { label: 'عطلة', color: 'from-amber-500 to-orange-600', icon: Calendar },
  registration: { label: 'تسجيل', color: 'from-blue-500 to-cyan-600', icon: CheckCircle2 },
  deadline: { label: 'موعد نهائي', color: 'from-violet-500 to-purple-600', icon: Clock },
  default: { label: 'حدث', color: 'from-gray-400 to-gray-500', icon: Calendar },
}

export default function AcademicCalendarPage() {
  const { student } = useStudentAuthStore()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    studentApi.get<any[]>(`/academic-calendar?student_id=${student.id}`).then((data) => {
      setEvents(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, student])

  const getEventInfo = (event: any) => {
    const type = EVENT_TYPES[event.event_type] || EVENT_TYPES.default
    return type
  }

  const filtered = events.filter((e) => {
    const matchesSearch = !search || e.event_title?.includes(search) || e.description?.includes(search)
    const matchesType = filterType === 'all' || e.event_type === filterType
    return matchesSearch && matchesType
  })

  const grouped = filtered.reduce((acc: Record<string, any[]>, event) => {
    const date = event.event_date ? new Date(event.event_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : 'غير محدد'
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  const types = ['all', ...new Set(events.map((e) => e.event_type).filter(Boolean))]

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التقويم الأكاديمي</h1>
        <p className="text-gray-500 text-sm">الفعاليات والمواعيد الأكاديمية</p>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن فعالية..."
          className="w-full h-11 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t === 'all' ? 'الكل' : (EVENT_TYPES[t]?.label || t)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد فعاليات</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-sm font-bold text-gray-500 mb-3">{month}</h2>
              <div className="space-y-2">
                {monthEvents.map((event: any) => {
                  const info = getEventInfo(event)
                  return (
                    <div key={event.id}
                      className={`bg-white rounded-2xl shadow-sm border p-4 ${
                        event.is_holiday ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100'
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center shrink-0`}>
                          <info.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-sm">{event.event_title}</h3>
                            {event.is_holiday && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                <AlertTriangle className="h-3 w-3" /> عطلة رسمية
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{event.event_date || '---'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
