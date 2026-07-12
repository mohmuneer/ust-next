'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examSchedulesService } from '@/services/exam-schedules.service'
import { examsService } from '@/services/exams.service'
import { roomsService } from '@/services/rooms.service'
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
import type { ExamSchedule } from '@/types'

export default function ExamSchedulesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExamSchedule | null>(null)
  const [formData, setFormData] = useState({
    exam_id: 0,
    room_id: 0,
    exam_date: '',
    start_time: '',
    end_time: '',
    student_count: 0,
    notes: '',
    status: 'scheduled',
  })

  const { data } = useQuery({
    queryKey: ['exam-schedules'],
    queryFn: () => examSchedulesService.getAll(),
  })

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examsService.getAll(),
  })

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => examSchedulesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => examSchedulesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => examSchedulesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-schedules'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: ExamSchedule) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        exam_id: item.exam_id || 0,
        room_id: item.room_id || 0,
        exam_date: item.exam_date ? item.exam_date.slice(0, 10) : '',
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        student_count: item.student_count || 0,
        notes: item.notes || '',
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({ exam_id: 0, room_id: 0, exam_date: '', start_time: '', end_time: '', student_count: 0, notes: '', status: 'scheduled' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ exam_id: 0, room_id: 0, exam_date: '', start_time: '', end_time: '', student_count: 0, notes: '', status: 'scheduled' })
  }

  const handleSubmit = () => {
    if (!formData.exam_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<ExamSchedule>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'exam_title', label: 'الاختبار', sortable: true },
    { key: 'room_name', label: 'القاعة' },
    { key: 'exam_date', label: 'التاريخ', render: (e) => e.exam_date ? e.exam_date.slice(0, 10) : '---' },
    { key: 'start_time', label: 'وقت البدء' },
    { key: 'end_time', label: 'وقت الانتهاء' },
    { key: 'student_count', label: 'عدد الطلاب' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          scheduled: { label: 'مجدول', class: 'text-blue-600' },
          completed: { label: 'مكتمل', class: 'text-green-600' },
          cancelled: { label: 'ملغي', class: 'text-red-600' },
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
        title="جداول الاختبارات"
        description="إدارة جداول الاختبارات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة جدول
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن جدول..."
            id="exam-schedules-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'جداول الاختبارات')}
            onExportPDF={() => exportToPDF('exam-schedules-table', 'جداول الاختبارات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف جدول', message: 'هل أنت متأكد من حذف هذا الجدول؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد جداول بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل جدول الاختبار' : 'إضافة جدول اختبار جديد'}
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
            <label className="block text-sm font-medium mb-1">القاعة</label>
            <SearchableSelect
              value={formData.room_id}
              onChange={(v) => setFormData({ ...formData, room_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون قاعة' },
                ...(rooms || []).map((r: any) => ({ value: r.id, label: r.room_name })),
              ]}
              searchPlaceholder="بحث عن قاعة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'scheduled', label: 'مجدول' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ</label>
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
          <div>
            <label className="block text-sm font-medium mb-1">وقت الانتهاء</label>
            <Input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">عدد الطلاب</label>
            <Input
              type="number"
              value={formData.student_count}
              onChange={(e) => setFormData({ ...formData, student_count: Number(e.target.value) })}
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
