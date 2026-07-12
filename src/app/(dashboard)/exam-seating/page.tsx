'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examSeatingService } from '@/services/exam-seating.service'
import { examSchedulesService } from '@/services/exam-schedules.service'
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
import type { ExamSeating } from '@/types'

export default function ExamSeatingPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExamSeating | null>(null)
  const [formData, setFormData] = useState({
    exam_schedule_id: 0,
    student_id: 0,
    seat_number: '',
    row_number: 0,
    column_number: 0,
    notes: '',
    attendance_status: 'absent',
    check_in_time: '',
  })

  const { data } = useQuery({
    queryKey: ['exam-seating'],
    queryFn: () => examSeatingService.getAll(),
  })

  const { data: schedules } = useQuery({
    queryKey: ['exam-schedules'],
    queryFn: () => examSchedulesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => examSeatingService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-seating'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => examSeatingService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-seating'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => examSeatingService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-seating'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: ExamSeating) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        exam_schedule_id: item.exam_schedule_id || 0,
        student_id: item.student_id || 0,
        seat_number: item.seat_number || '',
        row_number: item.row_number || 0,
        column_number: item.column_number || 0,
        notes: item.notes || '',
        attendance_status: item.attendance_status,
        check_in_time: item.check_in_time || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ exam_schedule_id: 0, student_id: 0, seat_number: '', row_number: 0, column_number: 0, notes: '', attendance_status: 'absent', check_in_time: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ exam_schedule_id: 0, student_id: 0, seat_number: '', row_number: 0, column_number: 0, notes: '', attendance_status: 'absent', check_in_time: '' })
  }

  const handleSubmit = () => {
    if (!formData.exam_schedule_id || !formData.student_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<ExamSeating>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم الطالب' },
    { key: 'seat_number', label: 'رقم المقعد' },
    { key: 'row_number', label: 'رقم الصف' },
    { key: 'column_number', label: 'رقم العمود' },
    {
      key: 'attendance_status', label: 'حالة الحضور',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          present: { label: 'حاضر', class: 'text-green-600' },
          absent: { label: 'غائب', class: 'text-red-600' },
          late: { label: 'متأخر', class: 'text-yellow-600' },
        }
        const s = map[e.attendance_status] || { label: e.attendance_status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    { key: 'check_in_time', label: 'وقت التسجيل' },
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
        title="توزيع المقاعد"
        description="إدارة توزيع مقاعد الاختبارات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مقعد
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مقعد..."
            id="exam-seating-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'توزيع المقاعد')}
            onExportPDF={() => exportToPDF('exam-seating-table', 'توزيع المقاعد')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مقعد', message: 'هل أنت متأكد من حذف هذا المقعد؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مقاعد بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل المقعد' : 'إضافة مقعد جديد'}
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
            <label className="block text-sm font-medium mb-1">جدول الاختبار *</label>
            <SearchableSelect
              value={formData.exam_schedule_id}
              onChange={(v) => setFormData({ ...formData, exam_schedule_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر جدول...' },
                ...(schedules || []).map((s: any) => ({ value: s.id, label: s.exam_title || `جدول #${s.id}` })),
              ]}
              searchPlaceholder="بحث عن جدول..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الطالب</label>
            <Input
              type="number"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: Number(e.target.value) })}
              placeholder="أدخل رقم الطالب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم المقعد</label>
            <Input
              value={formData.seat_number}
              onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
              placeholder="أدخل رقم المقعد"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الصف</label>
            <Input
              type="number"
              value={formData.row_number}
              onChange={(e) => setFormData({ ...formData, row_number: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم العمود</label>
            <Input
              type="number"
              value={formData.column_number}
              onChange={(e) => setFormData({ ...formData, column_number: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">حالة الحضور</label>
            <Select
              value={formData.attendance_status}
              onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
              options={[
                { value: 'absent', label: 'غائب' },
                { value: 'present', label: 'حاضر' },
                { value: 'late', label: 'متأخر' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت التسجيل</label>
            <Input
              type="time"
              value={formData.check_in_time}
              onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
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
