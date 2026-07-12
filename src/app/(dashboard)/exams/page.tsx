'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { examsService } from '@/services/exams.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2, FileQuestion, CheckCircle2, XCircle } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Exam } from '@/types'

export default function ExamsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subject_id: 0,
    duration_minutes: 60,
    total_marks: 100,
    pass_mark: 50,
    exam_date: '',
    start_time: '',
    status: 'draft',
  })

  const { data } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsService.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => examsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => examsService.update(editingExam!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      handleClose()
    },
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
        title: exam.title,
        subject_id: exam.subject_id || 0,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        pass_mark: exam.pass_mark,
        exam_date: exam.exam_date ? exam.exam_date.slice(0, 10) : '',
        start_time: exam.start_time || '',
        status: exam.status,
      })
    } else {
      setEditingExam(null)
      setFormData({ title: '', subject_id: 0, duration_minutes: 60, total_marks: 100, pass_mark: 50, exam_date: '', start_time: '', status: 'draft' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingExam(null)
    setFormData({ title: '', subject_id: 0, duration_minutes: 60, total_marks: 100, pass_mark: 50, exam_date: '', start_time: '', status: 'draft' })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingExam) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Exam>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'عنوان الاختبار', sortable: true },
    { key: 'subject_name', label: 'المادة' },
    { key: 'duration_minutes', label: 'المدة (دقيقة)' },
    { key: 'total_marks', label: 'الدرجة' },
    { key: 'pass_mark', label: 'درجة النجاح' },
    { key: 'exam_date', label: 'تاريخ الاختبار', render: (e) => e.exam_date ? e.exam_date.slice(0, 10) : '---' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          draft: { label: 'مسودة', class: 'text-yellow-600' },
          published: { label: 'منشور', class: 'text-green-600' },
          closed: { label: 'مغلق', class: 'text-red-600' },
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
        title="الاختبارات الإلكترونية"
        description="إدارة الاختبارات الإلكترونية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء اختبار
          </Button>
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
            actions={(exam) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/exams/${exam.id}`)}>
                  <FileQuestion className="h-4 w-4 ml-1" /> الأسئلة
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpen(exam)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف اختبار', message: 'هل أنت متأكد من حذف هذا الاختبار؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(exam.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
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
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingExam ? 'حفظ التغييرات' : 'إنشاء'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">عنوان الاختبار *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان الاختبار"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المادة</label>
            <SearchableSelect
              value={formData.subject_id}
              onChange={(v) => setFormData({ ...formData, subject_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع المواد' },
                ...(subjects || []).map((s: any) => ({ value: s.id, label: s.subject_name })),
              ]}
              searchPlaceholder="بحث عن مادة..."
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
                { value: 'closed', label: 'مغلق' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المدة (دقيقة)</label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الدرجة الكلية</label>
            <Input
              type="number"
              value={formData.total_marks}
              onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">درجة النجاح</label>
            <Input
              type="number"
              value={formData.pass_mark}
              onChange={(e) => setFormData({ ...formData, pass_mark: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الاختبار</label>
            <Input
              type="date"
              value={formData.exam_date}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت البدء</label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
