'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, MapPin, Clock, User, BookOpen, AlertTriangle, X,
  Search, Filter, Printer, FileText, ChevronLeft,
  ChevronRight, Layers, GraduationCap, Hash, Building,
  Mail, Phone, Award, Loader2, Inbox, ExternalLink,
} from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { studentScheduleService, type ScheduleEntry } from '@/services/student-schedule.service'
import { PageErrorWrapper } from '@/components/ui/page-error-wrapper'

const DAYS_MAP: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}
const DAY_ORDER = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']

const SUBJECT_COLORS = [
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', light: '#EFF6FF', name: 'blue' },
  { bg: '#DCFCE7', border: '#22C55E', text: '#166534', light: '#F0FDF4', name: 'green' },
  { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', light: '#FFFBEB', name: 'amber' },
  { bg: '#F3E8FF', border: '#A855F7', text: '#6B21A8', light: '#FAF5FF', name: 'purple' },
  { bg: '#FFE4E6', border: '#F43F5E', text: '#9F1239', light: '#FFF1F2', name: 'rose' },
  { bg: '#CCFBF1', border: '#14B8A6', text: '#115E59', light: '#F0FDFA', name: 'teal' },
  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', light: '#FEF2F2', name: 'red' },
  { bg: '#E0E7FF', border: '#6366F1', text: '#3730A3', light: '#EEF2FF', name: 'indigo' },
  { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E', light: '#FEFCE8', name: 'yellow' },
  { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D', light: '#FDF2F8', name: 'pink' },
  { bg: '#D1FAE5', border: '#059669', text: '#065F46', light: '#ECFDF5', name: 'emerald' },
  { bg: '#CFFAFE', border: '#06B6D4', text: '#155E75', light: '#ECFEFF', name: 'cyan' },
  { bg: '#FDE68A', border: '#D97706', text: '#78350F', light: '#FEF3C7', name: 'amber2' },
  { bg: '#DDD6FE', border: '#7C3AED', text: '#5B21B6', light: '#EDE9FE', name: 'violet' },
  { bg: '#BAE6FD', border: '#0284C7', text: '#0C4A6E', light: '#E0F2FE', name: 'sky' },
  { bg: '#FECACA', border: '#DC2626', text: '#7F1D1D', light: '#FEE2E2', name: 'red2' },
]

const CONFLICT_COLOR = { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', light: '#FEF2F2' }

function getSubjectColor(subjectId: number) {
  return SUBJECT_COLORS[subjectId % SUBJECT_COLORS.length]
}

function getLectureType(s: ScheduleEntry): string {
  if (s.group_type === 'نظري') return 'theory'
  if (s.group_type === 'عملي') return 'practical'
  const n = (s.notes || '').toLowerCase()
  if (n.includes('مختبر') || n.includes('معمل') || n.includes('lab')) return 'lab'
  return 'theory'
}

const TYPE_LABELS: Record<string, string> = {
  theory: 'نظري', practical: 'عملي', lab: 'معمل', activity: 'نشاط',
}

function formatTime12(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.slice(0, 5).split(':')
  const hour = parseInt(h)
  const period = hour >= 12 ? 'م' : 'ص'
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${h12}:${m} ${period}`
}

function ScheduleSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="bg-white rounded-2xl h-96 border border-gray-100" />
    </div>
  )
}

export default function SchedulePage() {
  const { student } = useStudentAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<ScheduleEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ day: '', instructor: '', type: '', subject: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-schedule'],
    queryFn: () => studentScheduleService.getStudentSchedule(),
    enabled: hydrated && !!student,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const schedule = useMemo(() => data?.schedule || [], [data])
  const subjects = useMemo(() => data?.subjects || [], [data])
  const studentInfo = useMemo(() => data?.student || student, [data, student])
  const semester = data?.semester || null

  const subjectColorMap = useMemo(() => {
    const map: Record<number, typeof SUBJECT_COLORS[0]> = {}
    subjects.forEach((s, i) => { map[s.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length] })
    return map
  }, [subjects])

  const getCardColor = useCallback((s: ScheduleEntry) => {
    if (conflicts.has(s.id)) return CONFLICT_COLOR
    return subjectColorMap[s.study_subject_id] || getSubjectColor(s.study_subject_id)
  }, [subjectColorMap])

  const todayStr = useMemo(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[currentTime.getDay()]
  }, [currentTime])

  const nowTimeStr = useMemo(() => currentTime.toTimeString().slice(0, 5), [currentTime])

  const filteredSchedule = useMemo(() => {
    return schedule.filter((s: ScheduleEntry) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match = (s.subject_name || '').toLowerCase().includes(q)
          || (s.subject_code || '').toLowerCase().includes(q)
          || (s.employee_name || '').toLowerCase().includes(q)
          || (s.room || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (filters.day && s.day_key !== filters.day) return false
      if (filters.instructor && (s.employee_name || '') !== filters.instructor) return false
      if (filters.type && getLectureType(s) !== filters.type) return false
      if (filters.subject && String(s.study_subject_id) !== filters.subject) return false
      return true
    })
  }, [schedule, searchQuery, filters])

  const instructors = useMemo(() => {
    const set = new Set<string>()
    schedule.forEach((s) => { if (s.employee_name) set.add(s.employee_name) })
    return Array.from(set).sort()
  }, [schedule])

  const scheduleByDay = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {}
    DAY_ORDER.forEach((d) => { map[d] = [] })
    filteredSchedule.forEach((s) => {
      const key = s.day_key || s.day_of_week?.toLowerCase()
      if (map[key]) map[key].push(s)
    })
    DAY_ORDER.forEach((d) => {
      map[d].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
    })
    return map
  }, [filteredSchedule])

  const conflicts = useMemo(() => {
    const found: Set<number> = new Set()
    const dayTimeMap: Record<string, ScheduleEntry[]> = {}
    schedule.forEach((s) => {
      const key = `${s.day_key || s.day_of_week?.toLowerCase()}|${s.start_time}`
      if (!dayTimeMap[key]) dayTimeMap[key] = []
      dayTimeMap[key].push(s)
    })
    Object.values(dayTimeMap).forEach((items) => {
      if (items.length > 1) items.forEach((item) => found.add(item.id))
    })
    return found
  }, [schedule])

  const todayLectures = useMemo(() => scheduleByDay[todayStr] || [], [scheduleByDay, todayStr])
  const nextLecture = useMemo(() => {
    return todayLectures.find((s) => (s.start_time || '') > nowTimeStr)
  }, [todayLectures, nowTimeStr])

  const isCurrentLecture = useCallback((s: ScheduleEntry) => {
    const sDay = s.day_key || s.day_of_week?.toLowerCase()
    return sDay === todayStr && s.start_time?.slice(0, 5) <= nowTimeStr && s.end_time?.slice(0, 5) >= nowTimeStr
  }, [todayStr, nowTimeStr])

  const totalToday = todayLectures.length
  const firstToday = todayLectures.length > 0 ? todayLectures[0] : null
  const lastToday = todayLectures.length > 0 ? todayLectures[todayLectures.length - 1] : null
  const totalHours = data?.total_hours || 0

  const handlePrint = useCallback(() => { window.print() }, [])

  if (!hydrated) return null

  if (isLoading) {
    return <ScheduleSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="font-bold text-lg">خطأ في تحميل البيانات</h3>
          <p className="text-gray-500 text-sm">حدث خطأ أثناء تحميل الجدول الدراسي. يرجى المحاولة مرة أخرى.</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (!schedule.length) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            الجدول الدراسي
          </h1>
          <p className="text-sm text-gray-500 mt-1">{semester?.semester_name || ''}</p>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
              <Inbox className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="font-bold text-lg text-gray-700">لا توجد مقررات مسجلة</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              لم يتم تسجيل أي مقررات دراسية لك في {semester?.semester_name || 'هذا الفصل'}.
              {student?.study_group_id && (
                <>شعبتك: <span className="font-medium">{student.group_name || `#${student.study_group_id}`}</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageErrorWrapper>
    <div className="max-w-7xl mx-auto space-y-6 print:space-y-4" ref={printRef}>
      {/* Print header */}
      <div className="hidden print:flex print:items-center print:gap-4 print:mb-6 print:pb-4 print:border-b print:border-gray-300">
        <img src="/ust-logo.png" alt="" className="h-14 w-auto" />
        <div className="flex-1">
          <h2 className="text-lg font-bold">جامعة العلوم والتكنولوجيا</h2>
          <p className="text-sm text-gray-600">{studentInfo?.college_name || ''} - {studentInfo?.department_name || ''}</p>
        </div>
        <div className="text-left text-xs text-gray-500">
          <p>الطالب: {studentInfo?.full_name}</p>
          <p>الرقم الجامعي: {studentInfo?.student_number}</p>
          <p>{semester?.semester_name || ''}</p>
          <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      {/* Top header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            الجدول الدراسي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {semester?.semester_name || ''} — {studentInfo?.group_name || ''}
          </p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <Printer className="h-4 w-4" /> طباعة
        </button>
      </div>

      {/* Student info card */}
      {studentInfo && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:p-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">
              <User className="h-4 w-4 text-primary" />
              <span className="text-gray-900 font-medium">{studentInfo.full_name}</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Hash className="h-4 w-4 text-primary" />
              {studentInfo.student_number}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <GraduationCap className="h-4 w-4 text-primary" />
              {studentInfo.college_name || ''}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Building className="h-4 w-4 text-primary" />
              {studentInfo.department_name || ''}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Layers className="h-4 w-4 text-primary" />
              {studentInfo.level_name || ''}
            </span>
            {studentInfo.group_name && (
              <span className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="h-4 w-4 text-primary" />
                الشعبة: {studentInfo.group_name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalToday}</p>
          <p className="text-xs text-gray-500 mt-1">محاضرات اليوم</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {firstToday ? formatTime12(firstToday.start_time) : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">أول محاضرة</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {lastToday ? formatTime12(lastToday.end_time) : '--'}
          </p>
          <p className="text-xs text-gray-500 mt-1">آخر محاضرة</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalHours}</p>
          <p className="text-xs text-gray-500 mt-1">ساعة أسبوعياً</p>
        </div>
      </div>

      {/* Next lecture */}
      {nextLecture && (
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المحاضرة القادمة</p>
              <p className="font-semibold text-sm">
                {nextLecture.subject_name} — {formatTime12(nextLecture.start_time)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {nextLecture.room || ''} {nextLecture.employee_name ? `— ${nextLecture.employee_name}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts warning */}
      {conflicts.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 print:hidden">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm text-red-700 font-medium">يوجد تعارض في الجدول الدراسي</p>
            <p className="text-xs text-red-500 mt-0.5">{conflicts.size} محاضرة متعارضة</p>
          </div>
        </div>
      )}

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مادة، أستاذ، قاعة..."
            className="w-full h-10 pr-9 pl-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 h-10 rounded-xl border text-sm font-medium transition-colors ${
            showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          <Filter className="h-4 w-4" /> تصفية
          {(filters.day || filters.instructor || filters.type || filters.subject) && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
          <select value={filters.day} onChange={(e) => setFilters((f) => ({ ...f, day: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
            <option value="">كل الأيام</option>
            {DAY_ORDER.map((d) => <option key={d} value={d}>{DAYS_MAP[d]}</option>)}
          </select>
          <select value={filters.instructor} onChange={(e) => setFilters((f) => ({ ...f, instructor: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
            <option value="">كل الأساتذة</option>
            {instructors.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
            <option value="">كل الأنواع</option>
            <option value="theory">نظري</option>
            <option value="practical">عملي</option>
            <option value="lab">معمل</option>
          </select>
          <select value={filters.subject} onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none">
            <option value="">كل المواد</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
          {(filters.day || filters.instructor || filters.type || filters.subject) && (
            <button onClick={() => setFilters({ day: '', instructor: '', type: '', subject: '' })}
              className="h-10 px-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-100 transition-colors col-span-2 sm:col-span-4">
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* Weekly grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 print:border-gray-300" style={{ direction: 'ltr' }}>
          <div className="p-3 text-center text-xs font-medium text-gray-400 border-l border-gray-100 print:border-gray-300">
            الوقت
          </div>
          {DAY_ORDER.map((day) => (
            <div key={day} className={`p-3 text-center text-sm font-semibold border-l border-gray-100 print:border-gray-300 ${
              day === todayStr ? 'bg-primary/5 text-primary' : 'text-gray-700'
            }`}>
              <span className="hidden sm:inline">{DAYS_MAP[day]}</span>
              <span className="sm:hidden text-xs">{DAYS_MAP[day].slice(0, 2)}</span>
              {day === todayStr && <span className="block text-[10px] font-normal text-primary/70">اليوم</span>}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          {(() => {
            const allTimes = new Set<string>()
            schedule.forEach((s) => {
              if (s.start_time) allTimes.add(s.start_time.slice(0, 5))
            })
            const timeSlots = Array.from(allTimes).sort()

            if (timeSlots.length === 0) {
              return (
                <div className="p-12 text-center text-gray-400">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">لا توجد محاضرات</p>
                </div>
              )
            }

            return (
              <div>
                {timeSlots.map((slot) => (
                  <div key={slot} className="grid grid-cols-7 border-b border-gray-50 print:border-gray-200 min-h-[100px]" style={{ direction: 'ltr' }}>
                    <div className="p-2 text-[11px] text-gray-400 border-l border-gray-50 print:border-gray-200 flex items-start justify-center pt-3">
                      <div className="text-center">
                        <div className="font-medium">{formatTime12(slot)}</div>
                      </div>
                    </div>
                    {DAY_ORDER.map((day) => {
                      const entries = (scheduleByDay[day] || []).filter(
                        (s) => s.start_time?.slice(0, 5) === slot
                      )
                      return (
                        <div key={`${day}-${slot}`} className={`p-1 border-l border-gray-50 print:border-gray-200 relative ${
                          day === todayStr ? 'bg-blue-50/30' : ''
                        }`}>
                          {entries.map((s) => {
                            const colors = getCardColor(s)
                            const isCurrent = isCurrentLecture(s)
                            const isConflict = conflicts.has(s.id)
                            return (
                              <button key={s.id} onClick={() => setSelectedLecture(s)}
                                className={`w-full text-right rounded-lg p-2 transition-all hover:shadow-md border-r-[3px] mb-1 ${
                                  isCurrent ? 'ring-2 ring-primary/40' : ''
                                }`}
                                style={{ backgroundColor: colors.light, borderRightColor: colors.border }}>
                                <div className="flex items-start gap-1">
                                  {isConflict && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate" style={{ color: colors.text }}>
                                      {s.subject_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{s.subject_code}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{s.employee_name || ''}</p>
                                    <p className="text-[10px] text-gray-400 truncate">
                                      <MapPin className="h-2.5 w-2.5 inline ml-0.5" />{s.room || ''}
                                    </p>
                                    {s.group_name && (
                                      <span className="inline-block text-[9px] px-1 py-0.5 rounded mt-0.5"
                                        style={{ backgroundColor: colors.bg, color: colors.text }}>
                                        {s.group_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Color legend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:hidden">
        <p className="text-xs font-semibold text-gray-500 mb-3">المقررات</p>
        <div className="flex flex-wrap gap-3">
          {subjects.map((s) => {
            const c = subjectColorMap[s.id] || getSubjectColor(s.id)
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: c.border }} />
                <span className="text-xs text-gray-600">{s.subject_name}</span>
                <span className="text-[10px] text-gray-400">({s.subject_code || ''})</span>
              </div>
            )
          })}
        </div>
        {conflicts.size > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CONFLICT_COLOR.border }} />
            <span className="text-xs text-red-600 font-medium">تعارض</span>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedLecture && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedLecture(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl sm:rounded-t-2xl z-10">
              <h2 className="font-bold text-lg">تفاصيل المحاضرة</h2>
              <button onClick={() => setSelectedLecture(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Subject header */}
              {(() => {
                const colors = getCardColor(selectedLecture)
                return (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.light, borderRight: `4px solid ${colors.border}` }}>
                    <h3 className="font-bold text-lg" style={{ color: colors.text }}>{selectedLecture.subject_name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedLecture.subject_code || ''}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{TYPE_LABELS[getLectureType(selectedLecture)] || getLectureType(selectedLecture)}</span>
                      <span>•</span>
                      <span>{selectedLecture.weekly_hours || 0} ساعة أسبوعياً</span>
                    </div>
                  </div>
                )
              })()}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={User} label="عضو هيئة التدريس" value={selectedLecture.employee_name || '---'} />
                <DetailItem icon={Award} label="الدرجة العلمية" value={selectedLecture.employee_degree || '---'} />
                <DetailItem icon={Mail} label="البريد الإلكتروني" value={selectedLecture.employee_email || '---'} />
                <DetailItem icon={Phone} label="الهاتف" value={selectedLecture.employee_phone || '---'} />
                <DetailItem icon={MapPin} label="القاعة" value={selectedLecture.room || '---'} />
                <DetailItem icon={Building} label="الكلية" value={selectedLecture.college_name || '---'} />
                <DetailItem icon={Layers} label="القسم" value={selectedLecture.department_name || '---'} />
                <DetailItem icon={Hash} label="الشعبة" value={selectedLecture.group_name || '---'} />
                <DetailItem icon={Calendar} label="اليوم" value={DAYS_MAP[selectedLecture.day_key || selectedLecture.day_of_week?.toLowerCase()] || selectedLecture.day_of_week || ''} />
                <DetailItem icon={Clock} label="الوقت" value={`${formatTime12(selectedLecture.start_time)} — ${formatTime12(selectedLecture.end_time)}`} />
              </div>

              {selectedLecture.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">ملاحظات</p>
                  <p className="text-sm">{selectedLecture.notes}</p>
                </div>
              )}

              {conflicts.has(selectedLecture.id) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">يوجد تعارض في الجدول الدراسي مع محاضرة أخرى في نفس التوقيت.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:flex, .print\\:block, .print\\:space-y-4, .print\\:space-y-4 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          @page { size: A4 landscape; margin: 1cm; }
        }
      `}</style>
    </div>
    </PageErrorWrapper>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm font-medium truncate" title={value}>{value}</p>
      </div>
    </div>
  )
}
