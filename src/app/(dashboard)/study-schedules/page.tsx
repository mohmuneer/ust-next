'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Clock, MapPin, Zap, AlertTriangle, Printer, FileSpreadsheet } from 'lucide-react'
import { studySchedulesService } from '@/services/study-schedules.service'
import { systemService, type SystemSettingsData } from '@/services/system.service'
import { getImageUrl } from '@/lib/utils'
import { collegesService } from '@/services/colleges.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { externalEmployeesService } from '@/services/external-employees.service'
import { employeesService } from '@/services/employees.service'
import { employeeAssignmentsService } from '@/services/employee-assignments.service'
import { studyGroupsService } from '@/services/study-groups.service'
import { studyLevelsService } from '@/services/study-levels.service'
import { buildingsService } from '@/services/buildings.service'
import { roomsService } from '@/services/rooms.service'
import type { StudySchedule, StudySubject, StudyGroup } from '@/types'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const

const DAY_LABELS: Record<string, string> = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}

const SUBJECT_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-rose-100 border-rose-300 text-rose-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-lime-100 border-lime-300 text-lime-800',
  'bg-violet-100 border-violet-300 text-violet-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
  'bg-sky-100 border-sky-300 text-sky-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-slate-100 border-slate-300 text-slate-800',
]

const CONFLICT_COLOR = 'bg-red-200 border-red-500 text-red-900 ring-2 ring-red-400'

function formatTime(t: unknown) {
  if (!t || typeof t !== 'string') return '--:--'
  const [h, m] = t.split(':')
  return `${h}:${m}`
}

function groupLabel(g: StudyGroup) {
  return `${g.group_name} (${g.group_type})`
}

function subjectLabel(s: StudySubject) {
  return s.subject_code ? `${s.subject_name} - ${s.subject_code}` : s.subject_name
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getSubjectKey(subjectName: string | undefined, subjectId: number) {
  return `${subjectName ?? ''}_${subjectId}`
}

function buildColorMap(schedules: StudySchedule[]) {
  const map = new Map<string, string>()
  let idx = 0
  for (const s of schedules) {
    const key = getSubjectKey(s.subject_name, s.study_subject_id)
    if (!map.has(key)) {
      map.set(key, SUBJECT_COLORS[idx % SUBJECT_COLORS.length])
      idx++
    }
  }
  return map
}

function findConflicts(schedules: StudySchedule[]) {
  const roomDayTime = new Map<string, StudySchedule[]>()
  const empDayTime = new Map<string, StudySchedule[]>()
  const conflictIds = new Set<number>()

  for (const s of schedules) {
    const st = s.start_time ? timeToMinutes(s.start_time.slice(0, 5)) : 0
    const et = s.end_time ? timeToMinutes(s.end_time.slice(0, 5)) : 0
    if (!s.room && !s.employee_id && !s.external_employee_id) continue

    if (s.room) {
      const key = `${s.day_of_week}|${s.room}`
      if (!roomDayTime.has(key)) roomDayTime.set(key, [])
      roomDayTime.get(key)!.push(s)
    }

    const empKey = `${s.day_of_week}|${s.employee_id ?? s.external_employee_id}`
    if ((s.employee_id || s.external_employee_id) && empKey) {
      if (!empDayTime.has(empKey)) empDayTime.set(empKey, [])
      empDayTime.get(empKey)!.push(s)
    }
  }

  function checkOverlaps(groups: Map<string, StudySchedule[]>) {
    for (const [, group] of groups) {
      if (group.length < 2) continue
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i], b = group[j]
          const aSt = a.start_time ? timeToMinutes(a.start_time.slice(0, 5)) : 0
          const aEt = a.end_time ? timeToMinutes(a.end_time.slice(0, 5)) : 0
          const bSt = b.start_time ? timeToMinutes(b.start_time.slice(0, 5)) : 0
          const bEt = b.end_time ? timeToMinutes(b.end_time.slice(0, 5)) : 0
          if (aSt < bEt && bSt < aEt) {
            conflictIds.add(a.id)
            conflictIds.add(b.id)
          }
        }
      }
    }
  }

  checkOverlaps(roomDayTime)
  checkOverlaps(empDayTime)

  return conflictIds
}

function CollegeScheduleCard({
  title,
  count,
  slots,
  schedules,
  subjectColorMap,
  conflictIds,
  onEdit,
  onDelete,
}: {
  title: string
  count: number
  slots: string[]
  schedules: StudySchedule[]
  subjectColorMap: Map<string, string>
  conflictIds: Set<number>
  onEdit: (s: StudySchedule) => void
  onDelete: (id: number) => void
}) {
  const scheduleMap = useMemo(() => {
    const map = new Map<string, StudySchedule>()
    for (const s of schedules) {
      if (s.day_of_week && s.start_time) {
        const key = `${s.day_of_week}|${s.start_time.slice(0, 5)}`
        map.set(key, s)
      }
    }
    return map
  }, [schedules])

  function getEntries(day: string, time: string) {
    const results: StudySchedule[] = []
    for (const s of schedules) {
      if (s.day_of_week === day && s.start_time && s.start_time.slice(0, 5) === time) {
        results.push(s)
      }
    }
    return results
  }

  return (
    <div className="schedule-card rounded-xl border bg-card overflow-hidden">
      <div className="schedule-card-header bg-primary/10 px-5 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        <Badge variant="default">{count} محاضرة</Badge>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] schedule-grid-inner">
          <div className="grid grid-cols-[100px_repeat(6,1fr)] border-b bg-muted/30">
            <div className="schedule-time-header flex items-center justify-center p-3 text-xs font-bold text-muted-foreground border-l">
              الوقت
            </div>
            {DAYS.map(day => (
              <div key={day} className="schedule-day-header flex items-center justify-center p-3 text-sm font-bold border-l last:border-l-0">
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>
          {slots.map((time, idx) => {
            const nextTime = slots[idx + 1] ?? `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`
            return (
              <div key={time} className="grid grid-cols-[100px_repeat(6,1fr)] border-b last:border-b-0">
                <div className="schedule-time-cell flex items-center justify-center p-2 text-xs font-medium text-muted-foreground border-l bg-muted/10">
                  {time} - {nextTime}
                </div>
                {DAYS.map(day => {
                  const entries = getEntries(day, time)
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={`schedule-day-cell min-h-[95px] p-1 border-l last:border-l-0 ${entries.length > 1 ? 'bg-amber-50/50' : ''}`}
                    >
                      {entries.length === 0 ? (
                        <div className="flex h-full items-center justify-center" />
                      ) : entries.length === 1 ? (
                        (() => {
                          const lec = entries[0]
                          const isConflict = conflictIds.has(lec.id)
                          const cc = isConflict
                            ? CONFLICT_COLOR
                            : (subjectColorMap.get(getSubjectKey(lec.subject_name, lec.study_subject_id)) ?? 'bg-primary/5 border-primary/20')
                          return (
                            <div
                              className={`schedule-lecture h-full rounded-md border p-1.5 text-xs space-y-1 cursor-pointer hover:shadow-sm transition-shadow ${cc}`}
                              onClick={() => onEdit(lec)}
                            >
                              <div className="font-bold leading-tight text-sm">
                                {lec.subject_name}
                              </div>
                              <div className="text-muted-foreground font-medium">
                                {lec.employee_name ?? lec.external_employee_name ?? ''}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground/70">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{lec.room ?? '—'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground/70">
                                <span>{lec.level_name ?? ''}</span>
                                {lec.department_name && <span className="truncate">· {lec.department_name}</span>}
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="space-y-1">
                          {entries.slice(0, 2).map(lec => {
                            const isConflict = conflictIds.has(lec.id)
                            const cc = isConflict
                              ? CONFLICT_COLOR
                              : (subjectColorMap.get(getSubjectKey(lec.subject_name, lec.study_subject_id)) ?? 'bg-primary/5 border-primary/20')
                            return (
                              <div
                                key={lec.id}
                                className={`schedule-lecture rounded border p-1 text-[10px] leading-tight cursor-pointer hover:shadow-sm ${cc}`}
                                onClick={() => onEdit(lec)}
                              >
                                <div className="font-bold">{lec.subject_name}</div>
                                <div className="text-muted-foreground">{lec.employee_name ?? ''}</div>
                                <div className="text-muted-foreground/70 flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {lec.room ?? ''}
                                </div>
                              </div>
                            )
                          })}
                          {entries.length > 2 && (
                            <div className="text-[10px] text-center text-muted-foreground bg-muted/30 rounded py-0.5">
                              +{entries.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function StudySchedulesPage() {
  const queryClient = useQueryClient()

  const [selectedCollege, setSelectedCollege] = useState(0)
  const [selectedSemester, setSelectedSemester] = useState(0)
  const [editingItem, setEditingItem] = useState<StudySchedule | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: colleges } = useQuery({ queryKey: ['colleges'], queryFn: () => collegesService.getAll() })

  const { data: semesters } = useQuery({ queryKey: ['academic-semesters'], queryFn: () => academicSemestersService.getAll() })

  const { data: systemSettings } = useQuery({ queryKey: ['system-settings'], queryFn: () => systemService.getSettings() })

  const logoUrl = systemSettings?.system_logo ? getImageUrl(systemSettings.system_logo) : null

  const { data: schedules = [] } = useQuery({
    queryKey: ['study-schedules', selectedCollege, selectedSemester],
    queryFn: () => studySchedulesService.getByCollegeAndSemester(selectedCollege, selectedSemester),
    enabled: selectedCollege > 0 && selectedSemester > 0,
  })

  const { data: subjects = [] } = useQuery({ queryKey: ['study-subjects'], queryFn: () => studySubjectsService.getAll() })

  const { data: externalEmployees = [] } = useQuery({ queryKey: ['external-employees'], queryFn: () => externalEmployeesService.getAll() })

  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: () => employeesService.getAll() })

  const { data: studyGroups = [] } = useQuery({ queryKey: ['study-groups'], queryFn: () => studyGroupsService.getAll() })

  const { data: studyLevels = [] } = useQuery({ queryKey: ['study-levels'], queryFn: () => studyLevelsService.getAll() })

  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => buildingsService.getAll() })

  const { data: allRooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => roomsService.getAll() })

  const { data: allAssignments = [] } = useQuery({
    queryKey: ['employee-assignments-all'],
    queryFn: () => employeeAssignmentsService.getAll(),
  })

  // ---- Cascading filter logic ----

  const selectedBuilding = formData.building_id as number || 0

  const filteredByCollegeSubjects = useMemo(
    () => subjects.filter(s => s.college_id === selectedCollege || selectedCollege === 0),
    [subjects, selectedCollege]
  )

  const filteredByCollegeBuildings = useMemo(
    () => buildings.filter(b => b.college_id === selectedCollege || selectedCollege === 0),
    [buildings, selectedCollege]
  )

  const filteredRooms = useMemo(
    () => allRooms.filter(r => r.building_id === selectedBuilding),
    [allRooms, selectedBuilding]
  )

  const selectedSubjectId = formData.study_subject_id as number || 0

  const assignmentSubjectIds = useMemo(
    () => new Set(allAssignments.map(a => a.study_subject_id).filter(Boolean)),
    [allAssignments]
  )

  const employeesBySubject = useMemo(
    () => {
      const subjectIds = allAssignments
        .filter(a => a.study_subject_id === selectedSubjectId || selectedSubjectId === 0)
        .map(a => a.employee_id)
      return employees.filter(e => subjectIds.includes(e.id))
    },
    [employees, allAssignments, selectedSubjectId]
  )

  const externalEmployeesBySubject = useMemo(
    () => {
      if (selectedSubjectId === 0) return externalEmployees
      return externalEmployees.filter(ee => ee.study_subject_id === selectedSubjectId)
    },
    [externalEmployees, selectedSubjectId]
  )

  function refetchSchedules() {
    queryClient.invalidateQueries({ queryKey: ['study-schedules'] })
  }

  const createMutation = useMutation({
    mutationFn: () => studySchedulesService.create(formData),
    onSuccess: () => { refetchSchedules(); handleClose() },
  })

  const updateMutation = useMutation({
    mutationFn: () => studySchedulesService.update(editingItem!.id, formData),
    onSuccess: () => { refetchSchedules(); handleClose() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studySchedulesService.delete(id),
    onSuccess: () => refetchSchedules(),
  })

  const generateMutation = useMutation({
    mutationFn: () => studySchedulesService.generate(selectedCollege, selectedSemester),
    onSuccess: (res) => {
      refetchSchedules()
      alert(res.message || 'تم إنشاء الجدول بنجاح')
    },
    onError: () => alert('فشل في إنشاء الجدول التلقائي'),
  })

  function openAdd() {
    setEditingItem(null)
    setFormData({
      college_id: selectedCollege,
      academic_semester_id: selectedSemester,
      day_of_week: '',
      start_time: '',
      end_time: '',
      study_subject_id: 0,
      external_employee_id: 0,
      employee_id: 0,
      study_group_id: 0,
      study_level_id: 0,
      building_id: 0,
      room_id: 0,
      room: '',
      notes: '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  function openEdit(item: StudySchedule) {
    setEditingItem(item)
    setFormData({
      college_id: item.college_id,
      academic_semester_id: item.academic_semester_id,
      day_of_week: item.day_of_week,
      start_time: item.start_time ? item.start_time.slice(0, 5) : '',
      end_time: item.end_time ? item.end_time.slice(0, 5) : '',
      study_subject_id: item.study_subject_id,
      external_employee_id: item.external_employee_id || 0,
      employee_id: item.employee_id || 0,
      study_group_id: item.study_group_id || 0,
      study_level_id: item.study_level_id || 0,
      building_id: 0,
      room_id: 0,
      room: item.room || '',
      notes: item.notes || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  function handleClose() {
    setShowModal(false)
    setEditingItem(null)
    setFormData({})
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!formData.day_of_week) errs.day_of_week = 'مطلوب'
    if (!formData.start_time) errs.start_time = 'مطلوب'
    if (!formData.end_time) errs.end_time = 'مطلوب'
    if (!formData.study_subject_id || formData.study_subject_id === 0) errs.study_subject_id = 'مطلوب'
    if ((!formData.external_employee_id || formData.external_employee_id === 0) &&
        (!formData.employee_id || formData.employee_id === 0)) {
      errs.external_employee_id = 'اختر متعاقداً أو موظفاً'
    }
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errs.end_time = 'يجب أن يكون وقت النهاية بعد وقت البداية'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  function handleDelete(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه الحصة؟')) deleteMutation.mutate(id)
  }

  function handlePrint() {
    window.print()
  }

  function handleExportExcel() {
    const rows = [['الكلية', 'القسم', 'المستوى', 'المادة', 'الدكتور', 'اليوم', 'الوقت', 'القاعة']]
    for (const s of schedules) {
      rows.push([
        s.college_name ?? '',
        s.department_name ?? '',
        s.level_name ?? '',
        s.subject_name ?? '',
        s.employee_name ?? s.external_employee_name ?? '',
        DAY_LABELS[s.day_of_week] || s.day_of_week,
        `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`,
        s.room ?? '',
      ])
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `جدول_دراسي_${selectedCollege}_${selectedSemester}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSelectCollege(v: number | string) {
    setSelectedCollege(Number(v))
    const current = (semesters || []).find(s => s.is_current)
    if (current) setSelectedSemester(current.id)
    else setSelectedSemester(0)
  }

  function handleSelectSemester(v: number | string) {
    setSelectedSemester(Number(v))
  }

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'study_subject_id') {
        next.employee_id = 0
        next.external_employee_id = 0
      }
      if (field === 'building_id') {
        next.room_id = 0
        next.room = ''
      }
      if (field === 'room_id' && value && Number(value) > 0) {
        const room = allRooms.find(r => r.id === Number(value))
        next.room = room ? `${room.room_name}${room.room_code ? ` (${room.room_code})` : ''}` : ''
      }
      if (field === 'building_id' && (!value || Number(value) === 0)) {
        next.room_id = 0
        next.room = ''
      }
      return next
    })
  }

  const selectedEmployee = (externalEmployees || []).find(ee => ee.id === formData.external_employee_id)

  const subjectColorMap = useMemo(() => buildColorMap(schedules), [schedules])

  const conflictIds = useMemo(() => findConflicts(schedules), [schedules])

  const conflictCount = conflictIds.size

  const collegeScheduleMap = useMemo(() => {
    const map: Record<number, { name: string; rows: StudySchedule[]; slots: string[] }> = {}
    for (const s of schedules) {
      if (!map[s.college_id]) map[s.college_id] = { name: s.college_name ?? `كلية ${s.college_id}`, rows: [], slots: [] }
      map[s.college_id].rows.push(s)
    }
    for (const cid of Object.keys(map)) {
      const times = new Set<string>()
      for (const r of map[Number(cid)].rows) {
        if (r.start_time) times.add(r.start_time.slice(0, 5))
      }
      map[Number(cid)].slots = Array.from(times).sort()
    }
    return Object.values(map)
  }, [schedules])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <h1 className="text-2xl font-bold">الجداول الدراسية</h1>
        {selectedCollege > 0 && selectedSemester > 0 && (
          <div className="flex gap-2">
            <Button onClick={openAdd}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة حصة
            </Button>
            <Button
              variant="secondary"
              onClick={() => generateMutation.mutate()}
              isLoading={generateMutation.isPending}
            >
              <Zap className="ml-2 h-4 w-4" />
              توليد الجدول تلقائياً
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 no-print">
        <div className="w-64">
          <SearchableSelect
            label="الكلية"
            value={selectedCollege}
            onChange={handleSelectCollege}
            placeholder="اختر الكلية..."
            options={(colleges || []).map(c => ({ value: c.id, label: c.college_name }))}
          />
        </div>
        <div className="w-64">
          <SearchableSelect
            label="الترم الدراسي"
            value={selectedSemester}
            onChange={handleSelectSemester}
            placeholder="اختر الترم..."
            options={(semesters || []).map(s => ({
              value: s.id,
              label: s.is_current ? `${s.semester_name} ★` : s.semester_name,
            }))}
          />
        </div>
      </div>

      {schedules.length > 0 && (
        <div className="space-y-8">
          {conflictCount > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 flex items-center gap-2 text-red-800 text-sm no-print">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>تم اكتشاف <strong>{conflictCount}</strong> تعارض في الجدول (نفس القاعة أو نفس الموظف في نفس الوقت)</span>
            </div>
          )}
          <div className="print-header print-only">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12">
                {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />}
              </div>
              <div className="flex-1 text-center">
                <div className="text-base font-bold">{systemSettings?.system_name || 'الجامعة'}</div>
                <div className="text-[8pt] text-muted-foreground">{systemSettings?.address || ''}</div>
                <div className="text-[8pt] text-muted-foreground">{systemSettings?.contact_number ? `هاتف: ${systemSettings.contact_number}` : ''}{systemSettings?.admin_email ? ` | بريد: ${systemSettings.admin_email}` : ''}</div>
                <div className="text-[8pt] text-muted-foreground mt-0.5">الجداول الدراسية - الفصل الدراسي {(semesters || []).find(s => s.id === selectedSemester)?.semester_name || ''}</div>
              </div>
            </div>
            <hr className="my-1 border-t border-primary" />
          </div>
          {collegeScheduleMap.map((college, ci) => (
            <div key={college.name} className={`schedule-card ${ci > 0 ? 'print-only' : ''}`}>
              <CollegeScheduleCard
                title={college.name}
                count={college.rows.length}
                slots={college.slots}
                schedules={college.rows}
                subjectColorMap={subjectColorMap}
                conflictIds={conflictIds}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-2 items-center no-print">
            <span className="text-sm font-medium text-muted-foreground">دليل الألوان:</span>
            {Array.from(subjectColorMap.entries()).slice(0, 24).map(([key, cls]) => {
              const name = key.replace(/_\d+$/, '')
              const [bg] = cls.split(' ')
              return (
                <Badge key={key} variant="default" className={`${bg} border-transparent text-xs`}>
                  {name}
                </Badge>
              )
            })}
            {subjectColorMap.size > 24 && (
              <Badge variant="default" className="text-xs">+{subjectColorMap.size - 24}</Badge>
            )}
            <Badge variant="danger" className="text-xs">
              <AlertTriangle className="h-3 w-3 ml-1" /> تعارض
            </Badge>
          </div>

          <div className="space-y-2 no-print">
            <h2 className="text-lg font-semibold">جميع الحصص</h2>
            <DataTable
              columns={[
                { key: 'college_name', label: 'الكلية', hidden: true },
                { key: 'department_name', label: 'القسم' },
                { key: 'day_of_week', label: 'اليوم', render: (row: any) => DAY_LABELS[row.day_of_week] || row.day_of_week },
                { key: 'start_time', label: 'من', render: (row: any) => formatTime(row.start_time) },
                { key: 'end_time', label: 'إلى', render: (row: any) => formatTime(row.end_time) },
                { key: 'subject_name', label: 'المادة' },
                { key: 'employee_name', label: 'الموظف' },
                { key: 'level_name', label: 'المستوى' },
                { key: 'room', label: 'القاعة' },
              ]}
              data={schedules || []}
              actions={(row: StudySchedule) => (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
              searchable
              searchPlaceholder="بحث..."
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={editingItem ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
        className="no-print"
      >
        <div className="space-y-4" style={{ minWidth: 500 }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">اليوم</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.day_of_week as string || ''}
                onChange={(e) => updateField('day_of_week', e.target.value)}
              >
                <option value="">اختر اليوم...</option>
                {DAYS.map(day => <option key={day} value={day}>{DAY_LABELS[day]}</option>)}
              </select>
              {formErrors.day_of_week && <p className="mt-1 text-xs text-destructive">{formErrors.day_of_week}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">وقت البداية</label>
              <Input
                type="time"
                value={formData.start_time as string || ''}
                onChange={(e) => updateField('start_time', e.target.value)}
              />
              {formErrors.start_time && <p className="mt-1 text-xs text-destructive">{formErrors.start_time}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">وقت النهاية</label>
              <Input
                type="time"
                value={formData.end_time as string || ''}
                onChange={(e) => updateField('end_time', e.target.value)}
              />
              {formErrors.end_time && <p className="mt-1 text-xs text-destructive">{formErrors.end_time}</p>}
            </div>
          </div>

          {/* Subject */}
          <SearchableSelect
            label="المادة"
            value={formData.study_subject_id as number || 0}
            onChange={(v) => updateField('study_subject_id', Number(v))}
            placeholder="اختر المادة..."
            options={(filteredByCollegeSubjects || []).map(s => ({ value: s.id, label: subjectLabel(s) }))}
          />
          {formErrors.study_subject_id && <p className="mt-1 text-xs text-destructive">{formErrors.study_subject_id}</p>}

          {/* External Employee - filtered by subject */}
          <SearchableSelect
            label="المتعاقد الخارجي"
            value={formData.external_employee_id as number || 0}
            onChange={(v) => updateField('external_employee_id', Number(v))}
            placeholder="اختر المتعاقد..."
            options={(externalEmployeesBySubject || []).map(ee => ({
              value: ee.id,
              label: `${ee.full_name}${ee.work_time ? ` (${ee.work_time})` : ''}`,
            }))}
          />
          {selectedEmployee?.work_time && (
            <Badge variant="default" className="text-xs">
              <Clock className="ml-1 h-3 w-3" />
              وقت العمل المتاح: {selectedEmployee.work_time}
            </Badge>
          )}

          {/* Internal Employee - filtered by subject */}
          <SearchableSelect
            label="موظف داخلي"
            value={formData.employee_id as number || 0}
            onChange={(v) => updateField('employee_id', Number(v))}
            placeholder="اختر الموظف..."
            options={(employeesBySubject.length > 0 ? employeesBySubject : employees).map(emp => ({
              value: emp.id,
              label: `${emp.full_name}${emp.specialization ? ` - ${emp.specialization}` : ''}`,
            }))}
          />
          {formErrors.external_employee_id && <p className="mt-1 text-xs text-destructive">{formErrors.external_employee_id}</p>}

          {/* Group & Level */}
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="المجموعة"
              value={formData.study_group_id as number || 0}
              onChange={(v) => updateField('study_group_id', Number(v))}
              placeholder="اختر المجموعة..."
              options={(studyGroups || []).map(g => ({ value: g.id, label: groupLabel(g) }))}
            />
            <SearchableSelect
              label="المستوى"
              value={formData.study_level_id as number || 0}
              onChange={(v) => updateField('study_level_id', Number(v))}
              placeholder="اختر المستوى..."
              options={(studyLevels || []).map(l => ({ value: l.id, label: l.level_name }))}
            />
          </div>

          {/* Building - cascading to room */}
          <SearchableSelect
            label="المبنى"
            value={selectedBuilding}
            onChange={(v) => updateField('building_id', Number(v))}
            placeholder="اختر المبنى..."
            options={(filteredByCollegeBuildings || []).map(b => ({
              value: b.id,
              label: b.building_code ? `${b.building_name} (${b.building_code})` : b.building_name,
            }))}
          />

          {selectedBuilding > 0 && (
            <SearchableSelect
              label="القاعة"
              value={formData.room_id as number || 0}
              onChange={(v) => updateField('room_id', Number(v))}
              placeholder="اختر القاعة..."
              options={(filteredRooms || []).map(r => ({
                value: r.id,
                label: `${r.room_name}${r.room_code ? ` (${r.room_code})` : ''} - {${r.room_type}} - سعة ${r.capacity}`,
              }))}
            />
          )}

          {/* Manual room override */}
          <div>
            <label className="mb-1 block text-sm font-medium">القاعة (نص يدوي)</label>
            <Input
              placeholder="أو اكتب اسم القاعة يدوياً"
              value={formData.room as string || ''}
              onChange={(e) => updateField('room', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium">ملاحظات</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="اختياري"
              value={formData.notes as string || ''}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="default" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
