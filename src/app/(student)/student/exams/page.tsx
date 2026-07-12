'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileQuestion, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Play, ChevronLeft } from 'lucide-react'
import { studentApi } from '@/services/student-api'

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentApi.get<any[]>('/exams'),
      studentApi.get<any[]>('/exam-sessions'),
    ]).then(([e, s]) => {
      setExams(e || [])
      setSessions(s || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getExamStatus = (exam: any) => {
    const now = new Date()
    const examDate = exam.exam_date ? new Date(exam.exam_date) : null
    const startTime = exam.start_time
    const endTime = exam.end_time

    if (!examDate) return { label: 'غير محدد', color: 'bg-gray-100 text-gray-500', icon: XCircle }

    const examStart = new Date(examDate)
    if (startTime) {
      const [h, m] = startTime.split(':')
      examStart.setHours(parseInt(h), parseInt(m), 0)
    }
    const examEnd = new Date(examStart)
    if (endTime) {
      const [h, m] = endTime.split(':')
      examEnd.setHours(parseInt(h), parseInt(m), 0)
    } else {
      examEnd.setMinutes(examEnd.getMinutes() + (exam.duration_minutes || 60))
    }

    const hasSession = sessions.some((s) => s.exam_id === exam.id && (s.status === 'in_progress' || s.status === 'completed'))

    if (hasSession && sessions.some((s) => s.exam_id === exam.id && s.status === 'completed')) {
      return { label: 'تم الانتهاء', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 }
    }
    if (hasSession && sessions.some((s) => s.exam_id === exam.id && s.status === 'in_progress')) {
      return { label: 'قيد التنفيذ', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
    }
    if (now < examStart) {
      return { label: 'غير متاح', color: 'bg-gray-100 text-gray-500', icon: XCircle }
    }
    if (now >= examStart && now <= examEnd) {
      return { label: 'متاح الآن', color: 'bg-green-100 text-green-700', icon: Play }
    }
    return { label: 'انتهى', color: 'bg-red-100 text-red-700', icon: XCircle }
  }

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الاختبارات الإلكترونية</h1>
        <p className="text-gray-500 text-sm">جميع الاختبارات المتاحة</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <FileQuestion className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد اختبارات متاحة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const status = getExamStatus(exam)
            const isAvailable = status.label === 'متاح الآن'
            const inProgress = status.label === 'قيد التنفيذ'

            return (
              <div key={exam.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 transition-all ${
                  isAvailable ? 'border-green-200 ring-1 ring-green-100' :
                  inProgress ? 'border-amber-200 ring-1 ring-amber-100' :
                  'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ${
                    isAvailable ? 'from-green-500 to-emerald-600' :
                    inProgress ? 'from-amber-500 to-orange-600' :
                    'from-gray-300 to-gray-400'
                  }`}>
                    <FileQuestion className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm">{exam.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                        <status.icon className="h-3 w-3" /> {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{exam.subject_name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exam.exam_date || '---'}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.start_time?.substring(0, 5) || '---'} ({exam.duration_minutes || '?'} د)</span>
                      <span>الدرجة: {exam.total_marks || '---'}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {(isAvailable || inProgress) ? (
                      <button onClick={() => router.push(`/student/exams/take/${exam.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-lg shadow-primary/25">
                        <Play className="h-4 w-4" />
                        {inProgress ? 'استئناف' : 'ابدأ'}
                      </button>
                    ) : (
                      <button onClick={() => router.push(`/student/exams/${exam.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                        التفاصيل <ChevronLeft className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
