'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, MapPin, Clock, User, BookOpen, AlertTriangle, X,
  Search, Filter, Printer, Download, FileText, Image, Layers,
  GraduationCap, Hash, Building, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody } from '@/components/ui/card'
import { masterTimetableService, type MasterTimetableFilters } from '@/services/master-timetable.service'
import { collegesService } from '@/services/colleges.service'
import { departmentsService } from '@/services/departments.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { studyLevelsService } from '@/services/study-levels.service'
import { studyGroupsService } from '@/services/study-groups.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { employeesService } from '@/services/employees.service'
import { buildingsService } from '@/services/buildings.service'
import { programsService } from '@/services/programs.service'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const
const DAY_LABELS: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}

const LECTURE_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  theory:    { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', light: '#EFF6FF' },
  practical: { bg: '#DCFCE7', border: '#22C55E', text: '#166534', light: '#F0FDF4' },
  lab:       { bg: '#FFEDD5', border: '#F97316', text: '#9A3412', light: '#FFF7ED' },
  conflict:  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', light: '#FEF2F2' },
}

function getLectureType(s: any): string {
  if (s.group_type === 'نظري') return 'theory'
  if (s.group_type === 'عملي') return 'practical'
  if (s.group_type === 'معمل' || s.lecture_type === 'lab') return 'lab'
  return 'theory'
}

function formatTime(t: string | null | undefined) {
  if (!t) return '--:--'
  return t.slice(0, 5)
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
]

export default function MasterTimetablePage() {
  const [filters, setFilters] = useState<MasterTimetableFilters>({})
  const [selectedLecture, setSelectedLecture] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'instructor' | 'room' | 'building' | 'program' | 'level'>('grid')
  const [showConflicts, setShowConflicts] = useState(false)
  const [searchText, setSearchText] = useState('')

  const { data: colleges } = useQuery({ queryKey: ['colleges'], queryFn: () => collegesService.getAll() })
  const { data: semesters } = useQuery({ queryKey: ['academic-semesters'], queryFn: () => academicSemestersService.getAll() })
  const { data: levels } = useQuery({ queryKey: ['study-levels'], queryFn: () => studyLevelsService.getAll() })
  const { data: groups } = useQuery({ queryKey: ['study-groups'], queryFn: () => studyGroupsService.getAll() })
  const { data: subjects } = useQuery({ queryKey: ['study-subjects'], queryFn: () => studySubjectsService.getAll() })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesService.getAll() })
  const { data: buildings } = useQuery({ queryKey: ['buildings'], queryFn: () => buildingsService.getAll() })
  const { data: programs } = useQuery({ queryKey: ['programs'], queryFn: () => programsService.getAll() })
  const { data: departments } = useQuery({
    queryKey: ['departments', filters.college_id],
    queryFn: () => departmentsService.getByCollege(Number(filters.college_id)),
    enabled: !!filters.college_id,
  })

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['master-timetable', filters],
    queryFn: () => masterTimetableService.getData({ ...filters, search: searchText || undefined }),
  })

  const schedules = useMemo(() => timetableData?.schedules || [], [timetableData])
  const stats = useMemo(() => timetableData?.stats, [timetableData])
  const conflicts = useMemo(() => timetableData?.conflicts || [], [timetableData])
  const conflictIds = useMemo(() => new Set(conflicts.map((c: any) => c.schedule_id)), [conflicts])

  const uniqueTimeSlots = useMemo(() => {
    const slots = new Set<string>()
    schedules.forEach((s: any) => { if (s.start_time) slots.add(s.start_time.slice(0, 5)) })
    return Array.from(slots).sort()
  }, [schedules])

  const scheduleByDayAndTime = useMemo(() => {
    const map = new Map<string, any[]>()
    schedules.forEach((s: any) => {
      const key = `${s.day_of_week}|${s.start_time?.slice(0, 5)}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    })
    return map
  }, [schedules])

  function getEntries(day: string, time: string) {
    return scheduleByDayAndTime.get(`${day}|${time}`) || []
  }

  function getLectureColors(s: any) {
    if (conflictIds.has(s.id)) return LECTURE_COLORS.conflict
    return LECTURE_COLORS[getLectureType(s)] || LECTURE_COLORS.theory
  }

  const handleFilterChange = useCallback((key: string, val: any) => {
    const v = val === '' || val === 'all' ? undefined : val
    setFilters((prev) => {
      const next = { ...prev, [key]: v }
      if (key === 'college_id') {
        delete next.department_id
        delete next.program_id
      }
      return next
    })
  }, [])

  const handlePrint = useCallback(() => { window.print() }, [])

  const currentSemester = useMemo(() => {
    if (!semesters) return null
    return semesters.find((s: any) => s.is_current) || semesters[0]
  }, [semesters])

  return (
    <div className="space-y-6">
      <PageHeader
        title="الجداول الدراسية العامة"
        description="عرض وإدارة الجداول الدراسية على مستوى الجامعة"
        actions={
          <div className="flex items-center gap-2">
            {conflicts.length > 0 && (
              <button onClick={() => setShowConflicts(!showConflicts)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                {conflicts.length} تعارض
              </button>
            )}
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" /> طباعة
            </button>
          </div>
        }
      />

      {/* ─── Filters ─── */}
      <Card>
        <CardBody className="p-0">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              أدوات البحث والتصفية
            </span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showFilters && (
            <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-gray-100 pt-4">
              <FilterSelect
                label="الفصل الدراسي" value={filters.academic_semester_id}
                onChange={(v) => handleFilterChange('academic_semester_id', v)}
                options={semesters?.map((s: any) => ({ value: s.id, label: s.semester_name })) || []}
                placeholder="اختر الفصل"
              />
              <FilterSelect
                label="الكلية" value={filters.college_id}
                onChange={(v) => handleFilterChange('college_id', v)}
                options={colleges?.map((c: any) => ({ value: c.id, label: c.college_name })) || []}
                placeholder="كل الكليات"
              />
              <FilterSelect
                label="البرنامج" value={filters.program_id}
                onChange={(v) => handleFilterChange('program_id', v)}
                options={programs?.map((p: any) => ({ value: p.id, label: p.program_name })) || []}
                placeholder="كل البرامج"
              />
              <FilterSelect
                label="القسم" value={filters.department_id}
                onChange={(v) => handleFilterChange('department_id', v)}
                options={departments?.map((d: any) => ({ value: d.id, label: d.department_name })) || []}
                placeholder="كل الأقسام"
              />
              <FilterSelect
                label="المستوى" value={filters.study_level_id}
                onChange={(v) => handleFilterChange('study_level_id', v)}
                options={levels?.map((l: any) => ({ value: l.id, label: l.level_name })) || []}
                placeholder="كل المستويات"
              />
              <FilterSelect
                label="المجموعة" value={filters.study_group_id}
                onChange={(v) => handleFilterChange('study_group_id', v)}
                options={groups?.map((g: any) => ({ value: g.id, label: `${g.group_name} (${g.group_type})` })) || []}
                placeholder="كل المجموعات"
              />
              <FilterSelect
                label="المقرر" value={filters.study_subject_id}
                onChange={(v) => handleFilterChange('study_subject_id', v)}
                options={subjects?.map((s: any) => ({ value: s.id, label: `${s.subject_name} - ${s.subject_code}` })) || []}
                placeholder="كل المقررات"
              />
              <FilterSelect
                label="عضو هيئة التدريس" value={filters.instructor_id}
                onChange={(v) => handleFilterChange('instructor_id', v)}
                options={employees?.map((e: any) => ({ value: e.id, label: e.full_name })) || []}
                placeholder="كل الأعضاء"
              />
              <FilterSelect
                label="المبنى" value={filters.building_id}
                onChange={(v) => handleFilterChange('building_id', v)}
                options={buildings?.map((b: any) => ({ value: b.id, label: b.building_name })) || []}
                placeholder="كل المباني"
              />
              <FilterSelect
                label="نوع المحاضرة" value={filters.lecture_type}
                onChange={(v) => handleFilterChange('lecture_type', v)}
                options={[
                  { value: 'نظري', label: 'نظري' },
                  { value: 'عملي', label: 'عملي' },
                  { value: 'معمل', label: 'معمل' },
                ]}
                placeholder="كل الأنواع"
              />
              <FilterSelect
                label="اليوم" value={filters.day_of_week}
                onChange={(v) => handleFilterChange('day_of_week', v)}
                options={DAYS.map((d) => ({ value: d, label: DAY_LABELS[d] }))}
                placeholder="كل الأيام"
              />
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                  placeholder="بحث سريع..."
                  className="w-full h-10 pr-9 pl-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <button onClick={() => { setFilters({}); setSearchText('') }}
                className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── View Mode ─── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 ml-2">طريقة العرض:</span>
        {([
          { key: 'grid', label: 'أسبوعي' },
          { key: 'instructor', label: 'عضو هيئة تدريس' },
          { key: 'room', label: 'قاعة' },
          { key: 'program', label: 'برنامج' },
          { key: 'level', label: 'مستوى' },
        ] as const).map((mode) => (
          <button key={mode.key} onClick={() => setViewMode(mode.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === mode.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* ─── Statistics ─── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard label="الشعب" value={stats.total_groups} color="text-blue-600" />
          <StatCard label="المقررات" value={stats.total_subjects} color="text-emerald-600" />
          <StatCard label="أعضاء التدريس" value={stats.total_instructors} color="text-purple-600" />
          <StatCard label="القاعات المستخدمة" value={stats.total_rooms_used} color="text-orange-600" />
          <StatCard label="محاضرات أسبوعياً" value={stats.total_weekly} color="text-cyan-600" />
          <StatCard label="إشغال القاعات" value={`${stats.room_occupancy}%`} color="text-rose-600" />
          <StatCard label="التعارضات" value={stats.total_conflicts} color={stats.total_conflicts > 0 ? 'text-red-600' : 'text-green-600'} />
          <StatCard label="الساعات التدريسية" value={stats.total_weekly_hours} color="text-indigo-600" />
        </div>
      )}

      {/* ─── Conflicts panel ─── */}
      {showConflicts && conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-800 text-sm">التعارضات</h3>
          </div>
          {conflicts.map((c: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-white/60 rounded-xl p-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{c.message}</p>
                <p className="text-xs text-red-500 mt-0.5">
                  {DAY_LABELS[c.day] || c.day} {c.time}
                  {c.instructor ? ` - ${c.instructor}` : ''}
                  {c.room ? ` - ${c.room}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Loading ─── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">جاري تحميل الجدول...</p>
          </div>
        </div>
      )}

      {/* ─── Weekly Grid View ─── */}
      {!isLoading && viewMode === 'grid' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[110px_repeat(6,1fr)] border-b border-gray-100 bg-gray-50/50">
                <div className="p-3 text-center text-xs font-bold text-gray-400 border-l border-gray-100">
                  الوقت
                </div>
                {DAYS.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-bold border-l border-gray-100 last:border-l-0 text-gray-700">
                    {DAY_LABELS[day]}
                  </div>
                ))}
              </div>
              {uniqueTimeSlots.length === 0 && !isLoading && (
                <div className="p-16 text-center text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">لا توجد بيانات</p>
                  <p className="text-sm mt-1">اختر معايير التصفية لعرض الجدول</p>
                </div>
              )}
              {uniqueTimeSlots.map((time) => (
                <div key={time} className="grid grid-cols-[110px_repeat(6,1fr)] border-b border-gray-50 min-h-[100px]">
                  <div className="p-2 flex items-start justify-center pt-3 text-[11px] font-medium text-gray-400 border-l border-gray-50 bg-gray-50/30">
                    {time}
                  </div>
                  {DAYS.map((day) => {
                    const entries = getEntries(day, time)
                    return (
                      <div key={`${day}-${time}`} className={`p-1 border-l border-gray-50 last:border-l-0 relative ${
                        entries.length > 1 ? 'bg-amber-50/30' : ''
                      }`}>
                        {entries.map((s: any) => {
                          const colors = getLectureColors(s)
                          const isConflict = conflictIds.has(s.id)
                          return (
                            <button key={s.id} onClick={() => setSelectedLecture(s)}
                              className="w-full text-right rounded-lg p-1.5 mb-1 transition-all hover:shadow-md border-r-[3px] last:mb-0"
                              style={{ backgroundColor: colors.light, borderRightColor: colors.border }}
                            >
                              <div className="flex items-start gap-1">
                                {isConflict && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold truncate" style={{ color: colors.text }}>
                                    {s.subject_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400">{s.subject_code}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{s.employee_name || s.external_employee_name || ''}</p>
                                  <p className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
                                    <MapPin className="h-2.5 w-2.5 inline" />{s.room || ''}
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Instructor View ─── */}
      {!isLoading && viewMode === 'instructor' && (
        <div className="space-y-4">
          {groupBy(schedules, 'employee_name').map(([name, items]: [string, any[]]) => (
            <InstructorCard key={name} name={name} items={items} conflictIds={conflictIds} onSelect={setSelectedLecture} />
          ))}
          {schedules.length === 0 && <EmptyState />}
        </div>
      )}

      {/* ─── Room View ─── */}
      {!isLoading && viewMode === 'room' && (
        <div className="space-y-4">
          {groupBy(schedules, 'room').map(([room, items]: [string, any[]]) => (
            <RoomCard key={room} room={room} items={items} conflictIds={conflictIds} onSelect={setSelectedLecture} />
          ))}
          {schedules.length === 0 && <EmptyState />}
        </div>
      )}

      {/* ─── Program View ─── */}
      {!isLoading && viewMode === 'program' && (
        <div className="space-y-4">
          {groupBy(schedules, 'department_name').map(([dept, items]: [string, any[]]) => (
            <GroupCard key={dept} title={dept || 'بدون قسم'} items={items} conflictIds={conflictIds} onSelect={setSelectedLecture} />
          ))}
          {schedules.length === 0 && <EmptyState />}
        </div>
      )}

      {/* ─── Level View ─── */}
      {!isLoading && viewMode === 'level' && (
        <div className="space-y-4">
          {groupBy(schedules, 'level_name').map(([level, items]: [string, any[]]) => (
            <GroupCard key={level} title={level || 'بدون مستوى'} items={items} conflictIds={conflictIds} onSelect={setSelectedLecture} />
          ))}
          {schedules.length === 0 && <EmptyState />}
        </div>
      )}

      {/* ─── Color Legend ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:hidden">
        <p className="text-xs font-semibold text-gray-500 mb-3">دليل الألوان</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'نظري', key: 'theory' },
            { label: 'عملي', key: 'practical' },
            { label: 'معمل', key: 'lab' },
            { label: 'تعارض', key: 'conflict' },
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

      {/* ─── Detail Modal ─── */}
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
              <div className="p-4 rounded-xl" style={{ backgroundColor: getLectureColors(selectedLecture).light, borderRight: `4px solid ${getLectureColors(selectedLecture).border}` }}>
                <h3 className="font-bold text-lg">{selectedLecture.subject_name}</h3>
                <p className="text-sm text-gray-500">{selectedLecture.subject_code}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={User} label="عضو هيئة التدريس" value={selectedLecture.employee_name || selectedLecture.external_employee_name || '---'} />
                <DetailItem icon={Hash} label="رقم الشعبة" value={selectedLecture.group_name || '---'} />
                <DetailItem icon={MapPin} label="القاعة" value={selectedLecture.room || '---'} />
                <DetailItem icon={Building} label="المبنى" value={selectedLecture.building_name || '---'} />
                <DetailItem icon={Layers} label="النوع" value={selectedLecture.group_type || '---'} />
                <DetailItem icon={Clock} label="الوقت" value={`${formatTime(selectedLecture.start_time)} - ${formatTime(selectedLecture.end_time)}`} />
                <DetailItem icon={Calendar} label="اليوم" value={DAY_LABELS[selectedLecture.day_of_week] || ''} />
                <DetailItem icon={BookOpen} label="الساعات" value={`${selectedLecture.weekly_hours || 0} ساعة`} />
                <DetailItem icon={GraduationCap} label="الكلية" value={selectedLecture.college_name || '---'} />
                <DetailItem icon={Layers} label="المستوى" value={selectedLecture.level_name || '---'} />
                <DetailItem icon={Building} label="القسم" value={selectedLecture.department_name || '---'} />
                <DetailItem icon={User} label="الطلاب المسجلين" value={`${selectedLecture.enrolled_count || 0} طالب`} />
              </div>
              {selectedLecture.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                  <p className="text-sm">{selectedLecture.notes}</p>
                </div>
              )}
              {conflictIds.has(selectedLecture.id) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">يوجد تعارض في هذا التوقيت</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:flex, .print\\:block { visibility: visible; }
          .print\\:hidden { display: none !important; }
          @page { size: A4 landscape; margin: 1cm; }
        }
      `}</style>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: any; onChange: (v: any) => void; options: { value: any; label: string }[]; placeholder: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-gray-500 block">{label}</label>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </div>
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

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
      <p className="text-gray-400 font-medium">لا توجد محاضرات</p>
      <p className="text-sm text-gray-300 mt-1">حاول تغيير معايير التصفية</p>
    </div>
  )
}

function InstructorCard({ name, items, conflictIds, onSelect }: { name: string; items: any[]; conflictIds: Set<number>; onSelect: (s: any) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <span className="font-bold text-sm">{name || 'غير محدد'}</span>
        <span className="text-xs text-gray-400 mr-auto">{items.length} محاضرة</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-px bg-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 text-[10px] font-bold text-gray-400 text-center">الوقت</div>
          {DAYS.map((d) => (
            <div key={d} className="bg-gray-50 p-2 text-[10px] font-bold text-gray-600 text-center">{DAY_LABELS[d].slice(0, 2)}</div>
          ))}
          {timeSlots.map((time) => (
            <>
              <div key={`t-${time}`} className="bg-white p-1 text-[9px] text-gray-400 text-center flex items-center justify-center">{time}</div>
              {DAYS.map((day) => {
                const entry = items.find((s: any) => s.day_of_week === day && s.start_time?.startsWith(time))
                return (
                  <div key={`${day}-${time}`} className="bg-white p-0.5 min-h-[32px]">
                    {entry && (
                      <button onClick={() => onSelect(entry)}
                        className={`w-full h-full rounded text-[9px] p-0.5 text-right border-r-2 ${
                          conflictIds.has(entry.id) ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <span className="font-bold block truncate">{entry.subject_code}</span>
                        <span className="text-gray-400 truncate block">{entry.room}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoomCard({ room, items, conflictIds, onSelect }: { room: string; items: any[]; conflictIds: Set<number>; onSelect: (s: any) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-bold text-sm">{room || 'غير محدد'}</span>
        <span className="text-xs text-gray-400 mr-auto">{items.length} محاضرة</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-px bg-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 text-[10px] font-bold text-gray-400 text-center">الوقت</div>
          {DAYS.map((d) => (
            <div key={d} className="bg-gray-50 p-2 text-[10px] font-bold text-gray-600 text-center">{DAY_LABELS[d].slice(0, 2)}</div>
          ))}
          {timeSlots.map((time) => (
            <>
              <div key={`t-${time}`} className="bg-white p-1 text-[9px] text-gray-400 text-center flex items-center justify-center">{time}</div>
              {DAYS.map((day) => {
                const entry = items.find((s: any) => s.day_of_week === day && s.start_time?.startsWith(time))
                return (
                  <div key={`${day}-${time}`} className="bg-white p-0.5 min-h-[32px]">
                    {entry && (
                      <button onClick={() => onSelect(entry)}
                        className={`w-full h-full rounded text-[9px] p-0.5 text-right border-r-2 ${
                          conflictIds.has(entry.id) ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-400'
                        }`}
                      >
                        <span className="font-bold block truncate">{entry.subject_code}</span>
                        <span className="text-gray-400 truncate block">{entry.employee_name}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

function GroupCard({ title, items, conflictIds, onSelect }: { title: string; items: any[]; conflictIds: Set<number>; onSelect: (s: any) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-sm">{title}</span>
        <span className="text-xs text-gray-400 mr-2">{items.length} محاضرة</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-px bg-gray-100 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-2 text-[10px] font-bold text-gray-400 text-center">الوقت</div>
          {DAYS.map((d) => (
            <div key={d} className="bg-gray-50 p-2 text-[10px] font-bold text-gray-600 text-center">{DAY_LABELS[d].slice(0, 2)}</div>
          ))}
          {timeSlots.map((time) => (
            <>
              <div key={`t-${time}`} className="bg-white p-1 text-[9px] text-gray-400 text-center flex items-center justify-center">{time}</div>
              {DAYS.map((day) => {
                const entry = items.find((s: any) => s.day_of_week === day && s.start_time?.startsWith(time))
                return (
                  <div key={`${day}-${time}`} className="bg-white p-0.5 min-h-[32px]">
                    {entry && (
                      <button onClick={() => onSelect(entry)}
                        className={`w-full h-full rounded text-[9px] p-0.5 text-right border-r-2 ${
                          conflictIds.has(entry.id) ? 'bg-red-50 border-red-500' : 'bg-indigo-50 border-indigo-400'
                        }`}
                      >
                        <span className="font-bold block truncate">{entry.subject_code}</span>
                        <span className="text-gray-400 truncate block">{entry.employee_name}</span>
                        <span className="text-gray-400 truncate block">{entry.room}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

function groupBy(arr: any[], key: string): [string, any[]][] {
  const map = new Map<string, any[]>()
  arr.forEach((item: any) => {
    const k = item[key] || 'غير محدد'
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(item)
  })
  return Array.from(map.entries())
}
