'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Plus, AlertTriangle, ChevronLeft } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

type View = 'list' | 'create'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'تم الحل', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-500' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  low: { label: 'منخفضة', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'متوسطة', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'عالية', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'عاجلة', color: 'bg-red-100 text-red-600' },
}

export default function RequestsPage() {
  const { student } = useStudentAuthStore()
  const [view, setView] = useState<View>('list')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [issueTypeId, setIssueTypeId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [details, setDetails] = useState('')
  const [courseName, setCourseName] = useState('')
  const [locationName, setLocationName] = useState('')

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    studentApi.get<any[]>(`/student-requests?student_number=${student.student_number}`).then((data) => {
      setRequests(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, student])

  const handleSubmit = async () => {
    if (!details.trim() || !student) return
    setSubmitting(true)
    try {
      await studentApi.post('/student-requests', {
        student_number: student.student_number,
        issue_type_id: issueTypeId || undefined,
        priority,
        details,
        course_name: courseName || undefined,
        location_name: locationName || undefined,
      })
      const updated = await studentApi.get<any[]>(`/student-requests?student_number=${student.student_number}`)
      setRequests(updated || [])
      setView('list')
      setDetails('')
      setIssueTypeId('')
      setPriority('medium')
      setCourseName('')
      setLocationName('')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الطلبات</h1>
          <p className="text-gray-500 text-sm">تقديم ومتابعة الطلبات</p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" /> طلب جديد
          </button>
        ) : (
          <button onClick={() => setView('list')}
            className="inline-flex items-center gap-1 px-3 py-2 text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm">
            <ChevronLeft className="h-3 w-3" /> العودة
          </button>
        )}
      </div>

      {view === 'create' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-sm">طلب جديد</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">نوع المشكلة</label>
              <select value={issueTypeId} onChange={(e) => setIssueTypeId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">اختر نوع المشكلة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الأولوية</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">التفاصيل *</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)}
                rows={4} placeholder="اشرح مشكلتك بالتفصيل..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">اسم المادة</label>
                <input value={courseName} onChange={(e) => setCourseName(e.target.value)}
                  placeholder="اختياري"
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">الموقع</label>
                <input value={locationName} onChange={(e) => setLocationName(e.target.value)}
                  placeholder="اختياري"
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!details.trim() || submitting}
            className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50">
            {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      )}

      {view === 'list' && (
        <>
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">لا توجد طلبات سابقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const status = STATUS_MAP[r.status] || STATUS_MAP.pending
                const prio = PRIORITY_MAP[r.priority] || PRIORITY_MAP.medium
                return (
                  <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${prio.color}`}>
                            <AlertTriangle className="h-3 w-3" /> {prio.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{r.details}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                          {r.course_name && <span>المادة: {r.course_name}</span>}
                          {r.location_name && <span>الموقع: {r.location_name}</span>}
                          <span>{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
