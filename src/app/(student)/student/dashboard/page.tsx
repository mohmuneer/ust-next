'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, Calendar, Award, User, BookCopy, Layers, Clock,
  Bell, ChevronLeft, FileQuestion, CreditCard, TrendingUp, Percent, Users,
} from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

export default function StudentDashboardPage() {
  const router = useRouter()
  const { student } = useStudentAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && student) {
      fetch(`/api/student-dashboard?student_id=${student.id}`)
        .then((r) => r.json())
        .then((d) => setDashboardData(d))
        .catch(() => {})
    }
  }, [hydrated, student])

  if (!hydrated || !student) return null

  const gpa = student.cumulative_gpa ? parseFloat(student.cumulative_gpa).toFixed(3) : '---'
  const { enrollments, schedule, upcomingExams, notifications, attendance, fees } = dashboardData || {}
  const enrollCount = enrollments?.length || 0
  const attPct = attendance?.percentage ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Welcome + Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center shadow-inner">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">مرحباً، {student.full_name}</h1>
            <p className="text-sm text-gray-400">{student.college_name} - {student.level_name}</p>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-gray-400">الرقم الجامعي</p>
            <p className="font-mono text-sm font-bold">{student.student_number}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><BookCopy className="h-4 w-4 text-white" /></div>
            <span className="text-xs text-gray-500">المواد</span>
          </div>
          <p className="font-bold text-lg">{enrollCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Percent className="h-4 w-4 text-white" /></div>
            <span className="text-xs text-gray-500">الحضور</span>
          </div>
          <p className="font-bold text-lg">{attPct}%</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Award className="h-4 w-4 text-white" /></div>
            <span className="text-xs text-gray-500">المعدل</span>
          </div>
          <p className="font-bold text-lg">{gpa}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"><Layers className="h-4 w-4 text-white" /></div>
            <span className="text-xs text-gray-500">المستوى</span>
          </div>
          <p className="font-bold text-lg">{student.level_name || '---'}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الجدول', icon: Calendar, href: '/student/schedule', color: 'from-blue-500 to-indigo-600' },
          { label: 'الدرجات', icon: TrendingUp, href: '/student/grades', color: 'from-emerald-500 to-teal-600' },
          { label: 'حضور QR', icon: Users, href: '/student/qr-attendance', color: 'from-violet-500 to-purple-600' },
          { label: 'الامتحانات', icon: FileQuestion, href: '/student/exams', color: 'from-rose-500 to-pink-600' },
        ].map((link) => (
          <button key={link.label} onClick={() => router.push(link.href)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <link.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />محاضرات اليوم</h2>
            <button onClick={() => router.push('/student/schedule')} className="text-xs text-primary hover:underline flex items-center gap-1">
              الكل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {(!schedule || schedule.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد محاضرات اليوم</p>
          ) : (
            <div className="space-y-2">
              {(schedule || []).slice(0, 4).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {s.start_time?.substring(0, 5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject_name || 'مادة'}</p>
                    <p className="text-xs text-gray-400 truncate">{s.room ? `قاعة ${s.room}` : ''} {s.employee_name ? `- ${s.employee_name}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><FileQuestion className="h-4 w-4 text-rose-500" />الامتحانات القادمة</h2>
            <button onClick={() => router.push('/student/exams')} className="text-xs text-primary hover:underline flex items-center gap-1">
              الكل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {(!upcomingExams || upcomingExams.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد امتحانات قادمة</p>
          ) : (
            <div className="space-y-2">
              {(upcomingExams || []).slice(0, 4).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                    {e.total_marks}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.exam_date} | {e.start_time?.substring(0, 5)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fees + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-500" />الرسوم</h2>
            <button onClick={() => router.push('/student/fees')} className="text-xs text-primary hover:underline flex items-center gap-1">
              التفاصيل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {(!fees || fees.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد رسوم</p>
          ) : (
            <div className="space-y-2">
              {(fees || []).slice(0, 3).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm truncate">{f.fee_name || `رسوم ${f.fee_type_id}`}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    f.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {f.status === 'paid' ? 'مدفوع' : parseFloat(f.amount || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />آخر الإشعارات</h2>
            <button onClick={() => router.push('/student/notifications')} className="text-xs text-primary hover:underline flex items-center gap-1">
              الكل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {(!notifications || notifications.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-2">
              {(notifications || []).slice(0, 4).map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{n.title || 'إشعار'}</p>
                    <p className="text-[10px] text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
