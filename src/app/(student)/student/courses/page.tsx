'use client'

import { useState, useEffect, useMemo } from 'react'
import { BookOpen, Clock, Award, Percent, ChevronDown, ChevronUp } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

export default function CoursesPage() {
  const { student } = useStudentAuthStore()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    setLoading(true)
    studentApi.get<any>(`/student-schedule?student_id=${student.id}`)
      .then((d) => { setEnrollments(d.subjects || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [hydrated, student])

  const totalHours = useMemo(() => enrollments.reduce((s: number, e: any) => s + (Number(e.weekly_hours) || 0), 0), [enrollments])

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المواد الدراسية</h1>
          <p className="text-gray-500 text-sm">عرض المواد المسجلة والتفاصيل</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-primary" />
            {enrollments.length} مادة
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            {totalHours} ساعة
          </span>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد مواد مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enr) => {
            const open = expanded.has(enr.id)
            return (
              <div key={enr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => toggle(enr.id)} className="w-full p-4 flex items-center gap-4 text-right hover:bg-gray-50/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">{enr.subject_name || `مادة ${enr.study_subject_id}`}</h3>
                    <p className="text-xs text-gray-400">{enr.subject_code}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs text-gray-500">الساعات</p>
                    <p className="font-bold">{enr.weekly_hours || '---'}</p>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 mx-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-[10px] text-gray-500">الحالة</p>
                        <p className="text-xs font-bold">{enr.status === 'active' ? 'نشط' : enr.status}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <Award className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                        <p className="text-[10px] text-gray-500">الدرجة</p>
                        <p className="text-xs font-bold">{enr.grade_numeric ?? '---'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <Percent className="h-4 w-4 mx-auto text-green-500 mb-1" />
                        <p className="text-[10px] text-gray-500">نسبة الحضور</p>
                        <p className="text-xs font-bold">{enr.attendance_percentage != null ? `${enr.attendance_percentage}%` : '---'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <BookOpen className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                        <p className="text-[10px] text-gray-500">التقدير</p>
                        <p className="text-xs font-bold">{enr.grade_letter || '---'}</p>
                      </div>
                    </div>
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
