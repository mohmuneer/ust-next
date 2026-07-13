'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Calendar, MapPin, Clock, User, BookOpen, AlertTriangle, X,
  Search, Filter, Printer, Download, FileText, Image, ChevronLeft,
  ChevronRight, Layers, GraduationCap, Hash, Building, Bell,
} from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { studentScheduleService } from '@/services/student-schedule.service'
import { PageErrorWrapper } from '@/components/ui/page-error-wrapper'

const DAYS_MAP: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}
const DAY_ORDER = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
const DAY_ORDER_AR = DAY_ORDER.map((d) => DAYS_MAP[d])

const LECTURE_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  theory:   { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', light: '#EFF6FF' },
  practical:{ bg: '#DCFCE7', border: '#22C55E', text: '#166534', light: '#F0FDF4' },
  lab:      { bg: '#FFEDD5', border: '#F97316', text: '#9A3412', light: '#FFF7ED' },
  exam:     { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', light: '#FEF2F2' },
  activity: { bg: '#F3E8FF', border: '#A855F7', text: '#6B21A8', light: '#FAF5FF' },
}

function getLectureType(s: any): string {
  if (s.group_type === 'نظري') return 'theory'
  if (s.group_type === 'عملي') return 'practical'
  if (s.lecture_type === 'lab' || s.lecture_type === 'practical') return s.lecture_type
  const n = (s.notes || '').toLowerCase()
  if (n.includes('مختبر') || n.includes('معمل') || n.includes('lab')) return 'lab'
  return 'theory'
}

function getDayNumber(day: string): number {
  return DAY_ORDER.indexOf(day)
}

export default function SchedulePage() {
  const { student } = useStudentAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLecture, setSelectedLecture] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ day: '', instructor: '', type: '', building: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    setLoading(true)
    studentScheduleService.getStudentSchedule(student.id)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hydrated, student])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const schedule = useMemo(() => data?.schedule || [], [data])
  const subjects = useMemo(() => data?.subjects || [], [data])
  const studentInfo = useMemo(() => data?.student || student, [data, student])

  const todayStr = useMemo(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[currentTime.getDay()]
  }, [currentTime])

  const nowTimeStr = useMemo(() => {
    return currentTime.toTimeString().slice(0, 5)
  }, [currentTime])

  const filteredSchedule = useMemo(() => {
    return schedule.filter((s: any) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = (s.subject_name || '').toLowerCase().includes(q)
        const matchCode = (s.subject_code || '').toLowerCase().includes(q)
        const matchEmp = (s.employee_name || '').toLowerCase().includes(q)
        const matchRoom = (s.room || '').toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchEmp && !matchRoom) return false
      }
      if (filters.day && s.day_of_week !== filters.day) return false
      if (filters.instructor && (s.employee_name || '') !== filters.instructor) return false
      if (filters.type && getLectureType(s) !== filters.type) return false
      if (filters.building) {
        const rm = (s.room || '').toLowerCase()
        if (!rm.includes(filters.building.toLowerCase())) return false
      }
      return true
    })
  }, [schedule, searchQuery, filters])

  const instructors = useMemo(() => {
    const set = new Set<string>()
    schedule.forEach((s: any) => { if (s.employee_name) set.add(s.employee_name) })
    return Array.from(set)
  }, [schedule])

  const timeSlots = useMemo(() => {
    const slots = new Set<string>()
    schedule.forEach((s: any) => {
      if (s.start_time && s.end_time) slots.add(`${s.start_time!.slice(0,5)}-${s.end_time!.slice(0,5)}`)
    })
    return Array.from(slots).sort()
  }, [schedule])

  const scheduleByDay = useMemo(() => {
    const map: Record<string, any[]> = {}
    DAY_ORDER.forEach((d) => { map[d] = [] })
    filteredSchedule.forEach((s: any) => {
      if (map[s.day_of_week]) map[s.day_of_week].push(s)
    })
    DAY_ORDER.forEach((d) => {
      map[d].sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''))
    })
    return map
  }, [filteredSchedule])

  const conflicts = useMemo(() => {
    const found: Set<number> = new Set()
    const dayTimeMap: Record<string, any[]> = {}
    schedule.forEach((s: any) => {
      const key = `${s.day_of_week}|${s.start_time}`
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
    return todayLectures.find((s: any) => (s.start_time || '') > nowTimeStr)
  }, [todayLectures, nowTimeStr])

  const isCurrentLecture = useCallback((s: any) => {
    return s.day_of_week === todayStr && s.start_time <= nowTimeStr && s.end_time >= nowTimeStr
  }, [todayStr, nowTimeStr])

  const getCardStyle = (s: any) => {
    const isConflict = conflicts.has(s.id)
    if (isConflict) return LECTURE_COLORS.exam
    const type = getLectureType(s)
    return LECTURE_COLORS[type] || LECTURE_COLORS.theory
  }

  const totalToday = todayLectures.length
  const firstToday = todayLectures.length > 0 ? todayLectures[0] : null
  const lastToday = todayLectures.length > 0 ? todayLectures[todayLectures.length - 1] : null

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  if (!hydrated) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">جاري تحميل الجدول الدراسي...</p>
        </div>
      </div>
    )
  }

  return (
    <PageErrorWrapper>
    <div className="max-w-7xl mx-auto space-y-6 print:space-y-4" ref={printRef}>
      {/* ─── Print header (hidden on screen) ─── */}
      <div className="hidden print:flex print:items-center print:gap-4 print:mb-6 print:pb-4 print:border-b print:border-gray-300">
        <img src="/ust-logo.png" alt="" className="h-12 w-auto" />
        <div>
          <h2 className="text-lg font-bold">{studentInfo?.college_name || ''}</h2>
          <p className="text-sm text-gray-500">الجدول الدراسي للطالب</p>
        </div>
      </div>

      {/* ─── Top header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            الجدول الدراسي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.semester?.semester_name || ''} - عرض المحاضرات المسجلة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" /> طباعة
          </button>
        </div>
      </div>

      {/* ─── Student info card ─── */}
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
              <BookOpen className="h-4 w-4 text-primary" />
              {studentInfo.level_name || studentInfo.department_name || ''}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Layers className="h-4 w-4 text-primary" />
              {studentInfo.semester_name || ''}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <FileText className="h-4 w-4 text-primary" />
              {data?.total_subjects || 0} مادة
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Clock className="h-4 w-4 text-primary" />
              {data?.total_hours || 0} ساعة
            </span>
          </div>
        </div>
      )}

      {/* ─── Quick stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalToday}</p>
          <p className="text-xs text-gray-500 mt-1">محاضرات اليوم</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{firstToday ? firstToday.start_time?.slice(0, 5) : '--'}</p>
          <p className="text-xs text-gray-500 mt-1">أول محاضرة</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{lastToday ? lastToday.end_time?.slice(0, 5) : '--'}</p>
          <p className="text-xs text-gray-500 mt-1">آخر محاضرة</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{data?.total_hours || 0}</p>
          <p className="text-xs text-gray-500 mt-1">ساعة أسبوعياً</p>
        </div>
      </div>

      {/* ─── Next lecture countdown ─── */}
      {nextLecture && (
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المحاضرة القادمة</p>
              <p className="font-semibold text-sm">
                {nextLecture.subject_name} - {nextLecture.start_time?.slice(0, 5)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Conflicts warning ─── */}
      {conflicts.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 print:hidden">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">يوجد تعارض في الجدول الدراسي.</p>
        </div>
      )}

      {/* ─── Search & filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مادة، أستاذ، قاعة..."
            className="w-full h-10 pr-9 pl-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 h-10 rounded-xl border text-sm font-medium transition-colors ${
            showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" /> تصفية
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
          <select value={filters.day} onChange={(e) => setFilters((f) => ({ ...f, day: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
          >
            <option value="">كل الأيام</option>
            {DAY_ORDER.map((d) => (
              <option key={d} value={d}>{DAYS_MAP[d]}</option>
            ))}
          </select>
          <select value={filters.instructor} onChange={(e) => setFilters((f) => ({ ...f, instructor: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
          >
            <option value="">كل الأساتذة</option>
            {instructors.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
          >
            <option value="">كل الأنواع</option>
            <option value="theory">نظري</option>
            <option value="practical">عملي</option>
            <option value="lab">معمل</option>
          </select>
          <button onClick={() => setFilters({ day: '', instructor: '', type: '', building: '' })}
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      )}

      {/* ─── Weekly grid ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 print:border-gray-300" style={{ direction: 'ltr' }}>
          <div className="p-3 text-center text-xs font-medium text-gray-400 border-l border-gray-100 print:border-gray-300">
            الوقت
          </div>
          {DAY_ORDER.map((day, i) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-semibold border-l border-gray-100 print:border-gray-300 ${
                day === todayStr ? 'bg-primary/5 text-primary' : 'text-gray-700'
              }`}
            >
              <span className="hidden sm:inline">{DAYS_MAP[day]}</span>
              <span className="sm:hidden text-xs">{DAYS_MAP[day].slice(0, 2)}</span>
              {day === todayStr && (
                <span className="block text-[10px] font-normal text-primary/70">اليوم</span>
              )}
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="overflow-x-auto">
          {timeSlots.length > 0 ? (
            <div>
              {timeSlots.map((slot) => {
                const [start, end] = slot.split('-')
                return (
                  <div key={slot} className="grid grid-cols-7 border-b border-gray-50 print:border-gray-200 min-h-[100px]" style={{ direction: 'ltr' }}>
                    <div className="p-2 text-[11px] text-gray-400 border-l border-gray-50 print:border-gray-200 flex items-start justify-center pt-3">
                      <div className="text-center">
                        <div>{start}</div>
                        <div className="text-[10px]">{end}</div>
                      </div>
                    </div>
                    {DAY_ORDER.map((day) => {
                      const entries = (scheduleByDay[day] || []).filter(
                        (s: any) => s.start_time?.slice(0, 5) === start
                      )
                      return (
                        <div key={`${day}-${slot}`} className={`p-1 border-l border-gray-50 print:border-gray-200 relative ${
                          day === todayStr ? 'bg-blue-50/30' : ''
                        }`}>
                          {entries.map((s: any) => {
                            const colors = getCardStyle(s)
                            const isCurrent = isCurrentLecture(s)
                            const isConflict = conflicts.has(s.id)
                            return (
                              <button
                                key={s.id}
                                onClick={() => setSelectedLecture(s)}
                                className={`w-full text-right rounded-lg p-2 transition-all hover:shadow-md border-r-[3px] ${
                                  isCurrent ? 'ring-2 ring-primary/40' : ''
                                }`}
                                style={{
                                  backgroundColor: isConflict ? colors.light : colors.light,
                                  borderRightColor: colors.border,
                                }}
                              >
                                <div className="flex items-start gap-1">
                                  {isConflict && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate" style={{ color: colors.text }}>
                                      {s.subject_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{s.subject_code}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{s.employee_name || s.external_employee_name || ''}</p>
                                    <p className="text-[10px] text-gray-400 truncate">
                                      <MapPin className="h-2.5 w-2.5 inline ml-0.5" />
                                      {s.room || ''}
                                    </p>
                                    {s.group_name && (
                                      <span className="inline-block text-[9px] px-1 py-0.5 rounded mt-0.5" style={{ backgroundColor: colors.bg, color: colors.text }}>
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
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">لا توجد محاضرات مسجلة</p>
              <p className="text-sm mt-1">لم يتم تسجيل أي مواد دراسية للفصل الحالي</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Color legend ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:hidden">
        <p className="text-xs font-semibold text-gray-500 mb-3">دليل الألوان</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'نظري', key: 'theory' },
            { label: 'عملي', key: 'practical' },
            { label: 'معمل', key: 'lab' },
            { label: 'تعارض', key: 'exam' },
          ].map((item) => {
            const c = LECTURE_COLORS[item.key]
            return (
              <div key={item.key} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: c.light, borderColor: c.border }} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Detail modal ─── */}
      {selectedLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedLecture(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">تفاصيل المحاضرة</h2>
              <button onClick={() => setSelectedLecture(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: getCardStyle(selectedLecture).light, borderRight: `4px solid ${getCardStyle(selectedLecture).border}` }}>
                <h3 className="font-bold text-lg">{selectedLecture.subject_name}</h3>
                <p className="text-sm text-gray-500">{selectedLecture.subject_code}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={User} label="عضو هيئة التدريس" value={selectedLecture.employee_name || selectedLecture.external_employee_name || '---'} />
                <DetailItem icon={Hash} label="رقم الشعبة" value={selectedLecture.group_name || '---'} />
                <DetailItem icon={MapPin} label="القاعة" value={selectedLecture.room || '---'} />
                <DetailItem icon={Building} label="المبنى" value={selectedLecture.building_name || '---'} />
                <DetailItem icon={Layers} label="النوع" value={selectedLecture.group_type || '---'} />
                <DetailItem icon={Clock} label="الوقت" value={`${selectedLecture.start_time?.slice(0, 5) || ''} - ${selectedLecture.end_time?.slice(0, 5) || ''}`} />
                <DetailItem icon={Calendar} label="اليوم" value={DAYS_MAP[selectedLecture.day_of_week] || ''} />
                <DetailItem icon={BookOpen} label="عدد الساعات" value={`${selectedLecture.weekly_hours || 0} ساعة`} />
              </div>

              {selectedLecture.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
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

      {/* ─── Print styles ─── */}
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
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
