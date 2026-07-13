'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Calendar, CheckCircle2, FileText } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

export default function AssignmentsPage() {
  const { student } = useStudentAuthStore()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    studentApi.get<any[]>(`/student-course-assignments?student_id=${student.id}`).then((data) => {
      setCourses(data || [])
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

  const parseWeeklyPlan = (plan: any): any[] => {
    if (!plan) return []
    if (Array.isArray(plan)) return plan
    try { return JSON.parse(plan) } catch { return [] }
  }

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الواجبات الدراسية</h1>
        <p className="text-gray-500 text-sm">المناهج والواجبات الأسبوعية</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد مواد مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const open = expanded.has(course.id)
            const weeklyPlan = parseWeeklyPlan(course.weekly_plan)
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => toggle(course.id)} className="w-full p-4 flex items-center gap-4 text-right">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{course.subject_name || `مادة ${course.study_subject_id}`}</p>
                    <p className="text-xs text-gray-400">{course.subject_code}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className={`text-xs font-medium ${weeklyPlan.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {weeklyPlan.length > 0 ? `${weeklyPlan.length} أسابيع` : 'لا توجد خطط'}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 mx-4 border-t border-gray-100">
                    {weeklyPlan.length === 0 ? (
                      <div className="py-6 text-center">
                        <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">لا توجد واجبات محددة</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        {weeklyPlan.map((week: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-bold text-gray-700">الأسبوع {week.week || idx + 1}</span>
                            </div>
                            {week.topics && (
                              <p className="text-xs text-gray-600 mb-1">المواضيع: {week.topics}</p>
                            )}
                            {week.assignments && (
                              <div className="flex items-center gap-1.5 text-xs text-green-700">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>الواجبات: {week.assignments}</span>
                              </div>
                            )}
                            {week.activities && (
                              <p className="text-xs text-purple-600 mt-1">الأنشطة: {week.activities}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
