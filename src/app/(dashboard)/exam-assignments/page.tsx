'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Trash2, Link2, Building2, Layers, BookOpen, Users, GraduationCap, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { formatDateTime } from '@/lib/utils'

interface ExamOption { id: number; title: string; subject_name?: string }
interface CollegeOption { id: number; college_name: string }
interface DepartmentOption { id: number; department_name: string }
interface SubjectOption { id: number; subject_name: string; subject_code: string; weekly_hours: number }
interface LevelOption { id: number; level_name: string }
interface GroupOption { id: number; group_name: string; group_type: string }
interface AssignmentRow {
  id?: number
  college_id: number
  department_id: number
  study_level_id: number
  study_group_id: number
}

function CascadingRow({
  index, row, onChange, onRemove, options, loading,
}: {
  index: number; row: AssignmentRow; onChange: (i: number, r: AssignmentRow) => void; onRemove: (i: number) => void
  options: { colleges: CollegeOption[]; departments: DepartmentOption[]; subjects: SubjectOption[]; levels: LevelOption[]; groups: GroupOption[] }
  loading: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">التخصيص #{index + 1}</span>
        <button onClick={() => onRemove(index)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">الكلية</label>
          <SearchableSelect
            value={row.college_id}
            onChange={(v) => onChange(index, { ...row, college_id: Number(v), department_id: 0, study_level_id: 0, study_group_id: 0 })}
            options={[{ value: 0, label: '— اختر الكلية —' }, ...options.colleges.map(c => ({ value: c.id, label: c.college_name }))]}
            searchPlaceholder="بحث..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">القسم</label>
          <SearchableSelect
            value={row.department_id}
            onChange={(v) => onChange(index, { ...row, department_id: Number(v), study_level_id: 0, study_group_id: 0 })}
            options={[{ value: 0, label: '— اختر القسم —' }, ...options.departments.map(d => ({ value: d.id, label: d.department_name }))]}
            searchPlaceholder="بحث..."
            disabled={!row.college_id}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">المستوى الدراسي</label>
          <SearchableSelect
            value={row.study_level_id}
            onChange={(v) => onChange(index, { ...row, study_level_id: Number(v), study_group_id: 0 })}
            options={[{ value: 0, label: '— اختر المستوى —' }, ...options.levels.map(l => ({ value: l.id, label: l.level_name }))]}
            searchPlaceholder="بحث..."
            disabled={!row.department_id}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">المجموعة الدراسية</label>
          <SearchableSelect
            value={row.study_group_id}
            onChange={(v) => onChange(index, { ...row, study_group_id: Number(v) })}
            options={[{ value: 0, label: '— اختر المجموعة —' }, ...options.groups.map(g => ({ value: g.id, label: `${g.group_name} (${g.group_type || ''})` }))]}
            searchPlaceholder="بحث..."
            disabled={!row.study_level_id}
          />
        </div>
      </div>
    </div>
  )
}

export default function ExamAssignmentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<number>(0)
  const [semesterId, setSemesterId] = useState<number>(0)
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [expandedExam, setExpandedExam] = useState<number | null>(null)

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await fetch('/api/exams', { headers: { 'Content-Type': 'application/json' } })
      return res.json() as Promise<ExamOption[]>
    },
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: async () => {
      const res = await fetch('/api/academic-semesters', { headers: { 'Content-Type': 'application/json' } })
      return res.json()
    },
  })

  const { data: allAssignments, isLoading } = useQuery({
    queryKey: ['exam-assignments'],
    queryFn: async () => {
      const res = await fetch('/api/exam-assignments', { headers: { 'Content-Type': 'application/json' } })
      return res.json()
    },
  })

  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['employee-options'],
    queryFn: async () => {
      const res = await fetch('/api/employee-options', { headers: { 'Content-Type': 'application/json' } })
      return res.json() as Promise<{ colleges: CollegeOption[]; departments: DepartmentOption[]; subjects: SubjectOption[]; levels: LevelOption[]; groups: GroupOption[] }>
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validRows = rows.filter(r => r.college_id || r.department_id || r.study_level_id || r.study_group_id)
      const res = await fetch('/api/exam-assignments-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: selectedExamId, assignments: validRows, academic_semester_id: semesterId || null }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-assignments'] })
      setIsModalOpen(false)
      setSelectedExamId(0)
      setRows([])
      setSemesterId(0)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/exam-assignments/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-assignments'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const assignmentsByExam = useMemo(() => {
    const map: Record<number, any[]> = {}
    ;(allAssignments || []).forEach((a: any) => {
      if (!map[a.exam_id]) map[a.exam_id] = []
      map[a.exam_id].push(a)
    })
    return map
  }, [allAssignments])

  const handleOpen = (examId?: number) => {
    if (examId && assignmentsByExam[examId]) {
      setSelectedExamId(examId)
      setRows(assignmentsByExam[examId].map((a: any) => ({
        id: a.id, college_id: a.college_id || 0, department_id: a.department_id || 0,
        study_level_id: a.study_level_id || 0, study_group_id: a.study_group_id || 0,
      })))
      setSemesterId(assignmentsByExam[examId][0]?.academic_semester_id || 0)
    } else {
      setSelectedExamId(examId || 0)
      setRows([{ college_id: 0, department_id: 0, study_level_id: 0, study_group_id: 0 }])
      setSemesterId(0)
    }
    setIsModalOpen(true)
  }

  const addRow = () => setRows(prev => [...prev, { college_id: 0, department_id: 0, study_level_id: 0, study_group_id: 0 }])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, r: AssignmentRow) => setRows(prev => prev.map((row, idx) => idx === i ? r : row))

  const examColumns: Column<any>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'عنوان الاختبار', sortable: true },
    {
      key: 'assignments_count', label: 'التخصيصات',
      render: (e: any) => {
        const count = assignmentsByExam[e.id]?.length || 0
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            {count} تخصيص
          </span>
        )
      },
    },
    {
      key: 'details', label: 'التفاصيل',
      render: (e: any) => {
        const items = assignmentsByExam[e.id] || []
        if (items.length === 0) return <span className="text-gray-400 text-xs">لم يتم التخصيص بعد</span>
        const depts = [...new Set(items.map((i: any) => i.department_name || i.department_id).filter(Boolean))]
        const levels = [...new Set(items.map((i: any) => i.level_name || i.study_level_id).filter(Boolean))]
        return (
          <div className="text-xs text-gray-600 space-y-0.5">
            {depts.length > 0 && <p>{depts.length} قسم</p>}
            {levels.length > 0 && <p>{levels.length} مستوى</p>}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="توزيع الاختبارات"
        description="ربط الاختبارات بالكليات والأقسام والمجموعات الدراسية"
      />

      <Card>
        <CardBody>
          <DataTable
            columns={examColumns}
            data={exams || []}
            searchable
            searchPlaceholder="بحث عن اختبار..."
            id="exam-assignments-table"
            actions={(exam: any) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(exam.id)}>
                  <Link2 className="h-4 w-4 ml-1" /> تخصيص
                </Button>
              </div>
            )}
            emptyMessage="لا توجد اختبارات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="توزيع الاختبار"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending} disabled={!selectedExamId}>
              <Save className="h-4 w-4 ml-1" /> حفظ التوزيع
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاختبار *</label>
              <SearchableSelect
                value={selectedExamId}
                onChange={(v) => setSelectedExamId(Number(v))}
                options={[{ value: 0, label: '— اختر الاختبار —' }, ...(exams || []).map((e: any) => ({ value: e.id, label: e.title }))]}
                searchPlaceholder="بحث عن اختبار..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الفصل الدراسي</label>
              <SearchableSelect
                value={semesterId}
                onChange={(v) => setSemesterId(Number(v))}
                options={[{ value: 0, label: '— اختر الفصل —' }, ...(semesters || []).map((s: any) => ({ value: s.id, label: s.semester_name }))]}
                searchPlaceholder="بحث..."
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">التخصيصات ({rows.length})</h3>
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 ml-1" /> إضافة تخصيص
              </Button>
            </div>

            <div className="space-y-3">
              {rows.map((row, i) => (
                <CascadingRow
                  key={i}
                  index={i}
                  row={row}
                  onChange={updateRow}
                  onRemove={removeRow}
                  options={options || { colleges: [], departments: [], subjects: [], levels: [], groups: [] }}
                  loading={optionsLoading}
                />
              ))}
            </div>

            {rows.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لم يتم إضافة أي تخصيص بعد</p>
                <p className="text-xs mt-1">اضغط "إضافة تخصيص" لبدء ربط الاختبار بالأقسام والمجموعات</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
