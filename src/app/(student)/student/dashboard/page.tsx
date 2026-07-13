'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, BookOpen, Calendar, Award, User, BookCopy, Layers, Clock,
  Bell, ChevronLeft, FileQuestion, CreditCard, TrendingUp, Percent, Users,
  MapPin, AlertTriangle, Megaphone, FileText, Star, CheckCircle2,
  GraduationCap as CapIcon, Library, Mail, ClipboardList, Headphones, Stethoscope,
} from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { studentDashboardService, type DashboardData } from '@/services/student-dashboard.service'
import { ErrorBoundary, PageErrorFallback } from '@/components/ui/error-boundary'
import { DashboardSkeleton } from '@/components/ui/skeleton'

const DAYS_MAP: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const { student } = useStudentAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    setLoading(true)
    studentDashboardService.getDashboard(student.id)
      .then(setData)
      .catch(() => setError('فشل تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [hydrated, student])

  const todayStr = useMemo(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }, [])

  const todaySchedule = useMemo(() => {
    if (!data) return []
    return data.schedule
      .filter((s: any) => s.day_of_week === todayStr)
      .sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''))
  }, [data, todayStr])

  if (!hydrated) return null

  if (loading) return <DashboardSkeleton />

  if (error) {
    return <PageErrorFallback title="فشل تحميل البيانات" message={error} />
  }

  const s = data?.student || student
  const stats = data?.statistics
  const photo = s?.photo ? (s.photo.startsWith('/') ? s.photo : `/uploads/${s.photo}`) : null

  return (
    <ErrorBoundary fallback={<DashboardSkeleton />}>
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ─── Welcome Card ─── */}
      <div className="bg-gradient-to-l from-primary/10 via-blue-50 to-white rounded-2xl border border-primary/10 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">مرحباً، {s?.full_name || 'طالب'}</h1>
            <p className="text-sm text-gray-500 truncate">
              {s?.college_name || ''}{s?.department_name ? ` - ${s.department_name}` : ''}
            </p>
            {data?.semester && (
              <p className="text-xs text-primary/70 mt-0.5">{data.semester.semester_name}</p>
            )}
          </div>
          <div className="text-left hidden sm:block shrink-0">
            <p className="text-[10px] text-gray-400">الرقم الجامعي</p>
            <p className="font-mono text-sm font-bold">{s?.student_number}</p>
          </div>
        </div>
      </div>

      {/* ─── Statistics Cards ─── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'المعدل', value: stats?.cumulative_gpa ? parseFloat(stats.cumulative_gpa).toFixed(2) : '---', icon: Award, color: 'from-amber-500 to-orange-600' },
          { label: 'الساعات', value: stats?.total_earned_hours || 0, icon: Clock, color: 'from-blue-500 to-cyan-600' },
          { label: 'المواد', value: stats?.total_subjects || 0, icon: BookCopy, color: 'from-violet-500 to-purple-600' },
          { label: 'الحضور', value: `${stats?.attendance_percentage || 0}%`, icon: Percent, color: 'from-emerald-500 to-teal-600' },
          { label: 'الفصل GPA', value: stats?.semester_gpa ? parseFloat(stats.semester_gpa).toFixed(2) : '---', icon: TrendingUp, color: 'from-pink-500 to-rose-600' },
          { label: 'المستوى', value: s?.level_name || '---', icon: Layers, color: 'from-indigo-500 to-blue-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <item.icon className="h-4 w-4 text-white" />
            </div>
            <p className="font-bold text-sm sm:text-base">{item.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Quick Links ─── */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {[
          { label: 'الجدول', icon: Calendar, href: '/student/schedule', color: 'from-blue-500 to-indigo-600' },
          { label: 'الدرجات', icon: TrendingUp, href: '/student/grades', color: 'from-emerald-500 to-teal-600' },
          { label: 'الحضور', icon: Users, href: '/student/attendance', color: 'from-violet-500 to-purple-600' },
          { label: 'الامتحانات', icon: FileQuestion, href: '/student/exams', color: 'from-rose-500 to-pink-600' },
          { label: 'الرسوم', icon: CreditCard, href: '/student/fees', color: 'from-amber-500 to-orange-600' },
          { label: 'المقررات', icon: BookOpen, href: '/student/courses', color: 'from-cyan-500 to-blue-600' },
          { label: 'المستندات', icon: FileText, href: '/student/documents', color: 'from-gray-500 to-gray-700' },
          { label: 'الإشعارات', icon: Bell, href: '/student/notifications', color: 'from-yellow-500 to-amber-600' },
          { label: 'المكتبة', icon: Library, href: '/student/documents', color: 'from-teal-500 to-green-600' },
          { label: 'البريد', icon: Mail, href: '/student/messages', color: 'from-blue-400 to-blue-600' },
          { label: 'الطلبات', icon: ClipboardList, href: '/student/documents', color: 'from-purple-400 to-purple-600' },
          { label: 'الدعم', icon: Headphones, href: '/student/documents', color: 'from-red-400 to-red-600' },
        ].map((link) => (
          <button key={link.label} onClick={() => router.push(link.href)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 sm:p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mx-auto mb-1.5 shadow-sm`}>
              <link.icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">{link.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Two Columns ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />جدول اليوم</h2>
            <button onClick={() => router.push('/student/schedule')} className="text-xs text-primary hover:underline flex items-center gap-1">
              الكل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد محاضرات اليوم ({DAYS_MAP[todayStr] || ''})</p>
          ) : (
            <div className="space-y-2">
              {todaySchedule.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {s.start_time?.substring(0, 5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject_name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {s.room ? `قاعة ${s.room}` : ''} {s.employee_name ? `- ${s.employee_name}` : ''}
                    </p>
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
          {data?.upcomingExams.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد امتحانات قادمة</p>
          ) : (
            <div className="space-y-2">
              {data?.upcomingExams.slice(0, 4).map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                    {e.exam_date?.substring(5, 10)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.subject_name} | {e.start_time?.substring(0, 5)} | {e.duration_minutes} دقيقة</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Attendance Overview ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />الحضور والغياب</h2>
          <button onClick={() => router.push('/student/attendance')} className="text-xs text-primary hover:underline flex items-center gap-1">
            التفاصيل <ChevronLeft className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'المحاضرات', value: data?.attendance.total || 0, color: 'text-gray-700' },
            { label: 'الحضور', value: data?.attendance.present || 0, color: 'text-emerald-600' },
            { label: 'الغياب', value: data?.attendance.absent || 0, color: 'text-red-500' },
            { label: 'النسبة', value: `${data?.attendance.percentage || 0}%`, color: (data?.attendance.percentage || 0) >= 75 ? 'text-emerald-600' : (data?.attendance.percentage || 0) >= 50 ? 'text-amber-600' : 'text-red-600' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
        {(data?.attendance.percentage || 0) < 75 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">نسبة الحضور أقل من المطلوب (75%)</p>
          </div>
        )}
      </div>

      {/* ─── Fees + Notifications ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Fees */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-500" />الرسوم المالية</h2>
            <button onClick={() => router.push('/student/fees')} className="text-xs text-primary hover:underline flex items-center gap-1">
              التفاصيل <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
          {data?.fees.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد رسوم</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-green-700">{(data?.fees.total_paid || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-green-500">مسدد</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-red-700">{(data?.fees.total_due || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-red-500">المتبقي</p>
                </div>
              </div>
              <div className="space-y-2">
                {data?.fees.items.slice(0, 3).map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm truncate">{f.fee_name || `رسوم ${f.fee_type_id}`}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      f.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {f.status === 'paid' ? 'مدفوع' : `${(parseFloat(f.amount || 0)).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
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
          {data?.notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-2">
              {data?.notifications.slice(0, 4).map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/70">
                  <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{n.title || n.message || 'إشعار'}</p>
                    <p className="text-[10px] text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG') : ''}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Announcements ─── */}
      {data?.announcements && data.announcements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-indigo-500" />الإعلانات</h2>
          </div>
          <div className="space-y-2">
            {data.announcements.slice(0, 3).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <Megaphone className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.title || 'إعلان'}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{a.content || a.body || ''}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleDateString('ar-EG') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Academic Calendar ─── */}
      {data?.calendar && data.calendar.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-violet-500" />التقويم الأكاديمي</h2>
          </div>
          <div className="space-y-2">
            {data.calendar.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/70">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.event_name || c.title || 'حدث'}</p>
                  <p className="text-xs text-gray-400">{c.event_date || c.start_date || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
    </ErrorBoundary>
  )
}
