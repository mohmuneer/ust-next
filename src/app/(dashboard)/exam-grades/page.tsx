'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examGradesService } from '@/services/exam-grades.service'
import { examsService } from '@/services/exams.service'
import { studentsService } from '@/services/students.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { ExamGrade } from '@/types'

export default function ExamGradesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExamGrade | null>(null)
  const [formData, setFormData] = useState({
    exam_id: 0,
    student_id: 0,
    score: 0,
    percentage: 0,
    grade_letter: '',
    status: 'draft',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['exam-grades'],
    queryFn: () => examGradesService.getAll(),
  })

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => examGradesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-grades'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => examGradesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-grades'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => examGradesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-grades'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: ExamGrade) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        exam_id: item.exam_id || 0,
        student_id: item.student_id || 0,
        score: item.score || 0,
        percentage: item.percentage || 0,
        grade_letter: item.grade_letter || '',
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ exam_id: 0, student_id: 0, score: 0, percentage: 0, grade_letter: '', status: 'draft', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ exam_id: 0, student_id: 0, score: 0, percentage: 0, grade_letter: '', status: 'draft', notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.exam_id || !formData.student_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<ExamGrade>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'exam_title', label: 'الاختبار', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم الطالب' },
    { key: 'score', label: 'الدرجة' },
    { key: 'percentage', label: 'النسبة %', render: (e) => e.percentage != null ? `${e.percentage}%` : '---' },
    { key: 'grade_letter', label: 'التقدير' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          draft: { label: 'مسودة', class: 'text-yellow-600' },
          published: { label: 'منشور', class: 'text-green-600' },
          reviewed: { label: 'مراجع', class: 'text-blue-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (e) => formatDateTime(e.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="درجات الاختبارات"
        description="إدارة درجات الاختبارات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة درجة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن درجة..."
            id="exam-grades-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'درجات الاختبارات')}
            onExportPDF={() => exportToPDF('exam-grades-table', 'درجات الاختبارات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف درجة', message: 'هل أنت متأكد من حذف هذه الدرجة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد درجات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الدرجة' : 'إضافة درجة جديدة'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الاختبار *</label>
            <SearchableSelect
              value={formData.exam_id}
              onChange={(v) => setFormData({ ...formData, exam_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر اختبار...' },
                ...(exams || []).map((s: any) => ({ value: s.id, label: s.title })),
              ]}
              searchPlaceholder="بحث عن اختبار..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الطالب *</label>
            <SearchableSelect
              value={formData.student_id}
              onChange={(v) => setFormData({ ...formData, student_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر طالب...' },
                ...(students || []).map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.student_number})` })),
              ]}
              searchPlaceholder="بحث عن طالب..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'draft', label: 'مسودة' },
                { value: 'published', label: 'منشور' },
                { value: 'reviewed', label: 'مراجع' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الدرجة</label>
            <Input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">النسبة %</label>
            <Input
              type="number"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التقدير</label>
            <Input
              value={formData.grade_letter}
              onChange={(e) => setFormData({ ...formData, grade_letter: e.target.value })}
              placeholder="مثال: A, B+, C"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل ملاحظات"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
