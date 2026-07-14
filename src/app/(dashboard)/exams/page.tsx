'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { examsService } from '@/services/exams.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2, FileQuestion, Link2, Clock, Hash, CheckCircle2, XCircle, GraduationCap } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Exam } from '@/types'

interface CascadeOptions {
  colleges: { id: number; college_name: string }[]
  departments: { id: number; department_name: string }[]
  subjects: { id: number; subject_name: string; subject_code: string; weekly_hours: number }[]
  levels: { id: number; level_name: string }[]
  groups: { id: number; group_name: string; group_type: string }[]
}

export default function ExamsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [cascadeSelections, setCascadeSelections] = useState({
    college_id: 0, department_id: 0, subject_id: 0, level_id: 0, group_id: 0,
  })
  const [formData, setFormData] = useState({
    title: '', subject_id: 0, duration_minutes: 60, total_marks: 100,
    pass_mark: 50, exam_date: '', start_time: '', status: 'draft',
    instructions: '', allow_review: false, show_result_immediately: false,
  })

  const { data } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsService.getAll(),
  })

  const { data: cascadeOptions, isLoading: cascadeLoading } = useQuery({
    queryKey: ['employee-options', cascadeSelections.college_id, cascadeSelections.department_id, cascadeSelections.subject_id, cascadeSelections.level_id],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (cascadeSelections.college_id) params.set('college_id', String(cascadeSelections.college_id))
      if (cascadeSelections.department_id) params.set('department_id', String(cascadeSelections.department_id))
      if (cascadeSelections.subject_id) params.set('subject_id', String(cascadeSelections.subject_id))
      if (cascadeSelections.level_id) params.set('level_id', String(cascadeSelections.level_id))
      const res = await fetch(`/api/employee-options?${params}`, { headers: { 'Content-Type': 'application/json' } })
      return res.json() as Promise<CascadeOptions>
    },
  })

  const { data: assignmentCounts } = useQuery({
    queryKey: ['exam-assignment-counts'],
    queryFn: async () => {
      const res = await fetch('/api/exam-assignments', { headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      const counts: Record<number, number> = {}
      ;(data || []).forEach((a: any) => { counts[a.exam_id] = (counts[a.exam_id] || 0) + 1 })
      return counts
    },
  })

  const createMutation = useMutation({
    mutationFn: () => examsService.create(formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exams'] }); handleClose() },
  })

  const updateMutation = useMutation({
    mutationFn: () => examsService.update(editingExam!.id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exams'] }); handleClose() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => examsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam)
      setFormData({
        title: exam.title, subject_id: exam.subject_id || 0,
        duration_minutes: exam.duration_minutes, total_marks: exam.total_marks,
        pass_mark: exam.pass_mark, exam_date: exam.exam_date ? exam.exam_date.slice(0, 10) : '',
        start_time: exam.start_time || '', status: exam.status,
        instructions: (exam as any).instructions || '',
        allow_review: (exam as any).allow_review || false,
        show_result_immediately: (exam as any).show_result_immediately || false,
      })
    } else {
      setEditingExam(null)
      setFormData({
        title: '', subject_id: 0, duration_minutes: 60, total_marks: 100,
        pass_mark: 50, exam_date: '', start_time: '', status: 'draft',
        instructions: '', allow_review: false, show_result_immediately: false,
      })
      setCascadeSelections({ college_id: 0, department_id: 0, subject_id: 0, level_id: 0, group_id: 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingExam(null)
    setCascadeSelections({ college_id: 0, department_id: 0, subject_id: 0, level_id: 0, group_id: 0 })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingExam) updateMutation.mutate()
    else createMutation.mutate()
  }

  const subjects = cascadeOptions?.subjects || []

  const columns: Column<Exam>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'عنوان الاختبار', sortable: true },
    { key: 'subject_name', label: 'المادة' },
    { key: 'duration_minutes', label: 'المدة (د)', sortable: true },
    { key: 'total_marks', label: 'الدرجة' },
    { key: 'pass_mark', label: 'النجاح' },
    { key: 'exam_date', label: 'التاريخ', render: (e) => e.exam_date ? e.exam_date.slice(0, 10) : '---' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          draft: { label: 'مسودة', class: 'bg-yellow-100 text-yellow-800' },
          published: { label: 'منشور', class: 'bg-green-100 text-green-800' },
          closed: { label: 'مغلق', class: 'bg-red-100 text-red-800' },
        }
        const s = map[e.status] || { label: e.status, class: 'bg-gray-100 text-gray-800' }
        return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.class}`}>{s.label}</span>
      },
    },
    {
      key: 'assignments', label: 'التخصيصات',
      render: (e: any) => {
        const count = assignmentCounts?.[e.id] || 0
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
            {count}
          </span>
        )
      },
    },
    {
      key: 'created_at', label: 'أُضيف', sortable: true,
      render: (e) => formatDateTime(e.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الاختبارات الإلكترونية"
        description="إدارة الاختبارات الإلكترونية وتوزيعها على الأقسام والمجموعات"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/exam-assignments')} size="sm">
              <Link2 className="h-4 w-4 ml-1" /> توزيع الاختبارات
            </Button>
            <Button onClick={() => handleOpen()} size="sm">
              <Plus className="h-4 w-4 ml-1" /> إنشاء اختبار
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن اختبار..."
            id="exams-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الاختبارات')}
            onExportPDF={() => exportToPDF('exams-table', 'الاختبارات الإلكترونية')}
            actions={(exam: any) => (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => router.push(`/exams/${exam.id}`)}>
                  <FileQuestion className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpen(exam)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/exam-assignments')}>
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger" size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف اختبار', message: `هل أنت متأكد من حذف "${exam.title}"؟`, confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(exam.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            emptyMessage="لا توجد اختبارات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingExam ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingExam ? 'حفظ التغييرات' : 'إنشاء'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basic info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" /> المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">عنوان الاختبار *</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="أدخل عنوان الاختبار" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[
                  { value: 'draft', label: 'مسودة' }, { value: 'published', label: 'منشور' }, { value: 'closed', label: 'مغلق' },
                ]} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1"><Clock className="inline h-3.5 w-3.5 ml-1" />المدة (دقيقة)</label>
                <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الدرجة الكلية</label>
                <Input type="number" value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">درجة النجاح</label>
                <Input type="number" value={formData.pass_mark} onChange={(e) => setFormData({ ...formData, pass_mark: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تاريخ الاختبار</label>
                <Input type="date" value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وقت البدء</label>
                <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Cascading Academic Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> الارتباط الأكاديمي
            </h3>
            <p className="text-xs text-gray-400 mb-3">حدد الكلية والقسم والمادة والمستوى والمجموعة لربط الاختبار بالبيانات الأكاديمية</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الكلية</label>
                <SearchableSelect
                  value={cascadeSelections.college_id}
                  onChange={(v) => setCascadeSelections({ ...cascadeSelections, college_id: Number(v), department_id: 0, subject_id: 0, level_id: 0, group_id: 0 })}
                  options={[{ value: 0, label: '— اختر الكلية —' }, ...(cascadeOptions?.colleges || []).map(c => ({ value: c.id, label: c.college_name }))]}
                  searchPlaceholder="بحث..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">القسم</label>
                <SearchableSelect
                  value={cascadeSelections.department_id}
                  onChange={(v) => setCascadeSelections({ ...cascadeSelections, department_id: Number(v), subject_id: 0, level_id: 0, group_id: 0 })}
                  options={[{ value: 0, label: '— اختر القسم —' }, ...(cascadeOptions?.departments || []).map(d => ({ value: d.id, label: d.department_name }))]}
                  searchPlaceholder="بحث..."
                  disabled={!cascadeSelections.college_id}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">المادة</label>
                <SearchableSelect
                  value={cascadeSelections.subject_id}
                  onChange={(v) => {
                    const sid = Number(v)
                    const subj = subjects.find((s) => s.id === sid)
                    setCascadeSelections({ ...cascadeSelections, subject_id: sid, level_id: 0, group_id: 0 })
                    setFormData({ ...formData, subject_id: sid })
                  }}
                  options={[{ value: 0, label: '— اختر المادة —' }, ...subjects.map(s => ({ value: s.id, label: `${s.subject_code} - ${s.subject_name}` }))]}
                  searchPlaceholder="بحث..."
                  disabled={!cascadeSelections.department_id}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">المستوى الدراسي</label>
                <SearchableSelect
                  value={cascadeSelections.level_id}
                  onChange={(v) => setCascadeSelections({ ...cascadeSelections, level_id: Number(v), group_id: 0 })}
                  options={[{ value: 0, label: '— اختر المستوى —' }, ...(cascadeOptions?.levels || []).map(l => ({ value: l.id, label: l.level_name }))]}
                  searchPlaceholder="بحث..."
                  disabled={!cascadeSelections.subject_id}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">المجموعة الدراسية</label>
                <SearchableSelect
                  value={cascadeSelections.group_id}
                  onChange={(v) => setCascadeSelections({ ...cascadeSelections, group_id: Number(v) })}
                  options={[{ value: 0, label: '— اختر المجموعة —' }, ...(cascadeOptions?.groups || []).map(g => ({ value: g.id, label: `${g.group_name} (${g.group_type || ''})` }))]}
                  searchPlaceholder="بحث..."
                  disabled={!cascadeSelections.level_id}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> خيارات إضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">تعليمات الاختبار</label>
                <textarea
                  className="w-full h-20 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors resize-none"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="تعليمات إضافية للطلاب..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.allow_review} onChange={(e) => setFormData({ ...formData, allow_review: e.target.checked })} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm">السماح بمراجعة الإجابات</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.show_result_immediately} onChange={(e) => setFormData({ ...formData, show_result_immediately: e.target.checked })} className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm">عرض النتيجة فوراً</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
