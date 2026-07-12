'use client'

import { useState, useEffect } from 'react'
import { Award, BookOpen, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

export default function GradesPage() {
  const { student } = useStudentAuthStore()
  const [records, setRecords] = useState<any[]>([])
  const [semesterGpa, setSemesterGpa] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    Promise.all([
      studentApi.get<any>(`/student-schedule?student_id=${student.id}`),
      studentApi.get<any[]>(`/student-semester-gpa?student_id=${student.id}`).catch(() => []),
    ]).then(([scheduleData, gpaData]) => {
      setRecords(scheduleData?.subjects || [])
      setSemesterGpa(gpaData || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, student])

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const getGradeColor = (letter?: string) => {
    if (!letter) return 'text-gray-400'
    if (['A+','A','A-','B+','B'].includes(letter)) return 'text-green-600'
    if (['B-','C+','C'].includes(letter)) return 'text-amber-600'
    return 'text-red-600'
  }

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  const currentGpa = semesterGpa[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الدرجات</h1>
        <p className="text-gray-500 text-sm">السجل الأكاديمي والدرجات الدراسية</p>
      </div>

      {currentGpa && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">المعدل التراكمي</p>
            <p className="text-xl font-bold text-primary">{parseFloat(currentGpa.cumulative_gpa || '0').toFixed(3)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">معدل الفصل</p>
            <p className="text-xl font-bold text-emerald-600">{parseFloat(currentGpa.semester_gpa || '0').toFixed(3)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">الساعات التراكمية</p>
            <p className="text-xl font-bold">{currentGpa.cumulative_hours || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">ساعات الفصل</p>
            <p className="text-xl font-bold">{currentGpa.semester_hours || 0}</p>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد درجات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec) => {
            const open = expanded.has(rec.id)
            return (
              <div key={rec.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => toggle(rec.id)} className="w-full p-4 flex items-center gap-4 text-right">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{rec.subject_name || `مادة ${rec.study_subject_id}`}</p>
                    <p className="text-xs text-gray-400">{rec.subject_code}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className={`text-lg font-bold ${getGradeColor(rec.grade_letter)}`}>{rec.grade_letter || '---'}</p>
                    <p className="text-xs text-gray-400">{rec.grade_numeric ?? '---'}</p>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 border-t border-gray-100 mx-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <p className="text-[10px] text-gray-500">الدرجة العددية</p>
                        <p className="text-sm font-bold">{rec.grade_numeric ?? '---'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <p className="text-[10px] text-gray-500">النقاط</p>
                        <p className="text-sm font-bold">{rec.grade_points ?? '---'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <p className="text-[10px] text-gray-500">حالة</p>
                        <p className={`text-sm font-bold ${rec.is_pass ? 'text-green-600' : 'text-red-600'}`}>{rec.is_pass ? 'ناجح' : 'راسب'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 text-center">
                        <p className="text-[10px] text-gray-500">الحضور</p>
                        <p className="text-sm font-bold">{rec.attendance_percentage != null ? `${rec.attendance_percentage}%` : '---'}</p>
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
