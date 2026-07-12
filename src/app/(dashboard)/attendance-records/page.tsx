'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceRecordsService } from '@/services/attendance-records.service'
import { attendanceSessionsService } from '@/services/attendance-sessions.service'
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
import type { AttendanceRecord } from '@/types'

export default function AttendanceRecordsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AttendanceRecord | null>(null)
  const [formData, setFormData] = useState({
    attendance_session_id: 0,
    student_id: 0,
    status: 'present',
    check_in_time: '',
    check_in_method: 'manual',
    late_minutes: 0,
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: () => attendanceRecordsService.getAll(),
  })

  const { data: sessions } = useQuery({
    queryKey: ['attendance-sessions'],
    queryFn: () => attendanceSessionsService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => attendanceRecordsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => attendanceRecordsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attendanceRecordsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-records'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: AttendanceRecord) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        attendance_session_id: item.attendance_session_id,
        student_id: item.student_id,
        status: item.status,
        check_in_time: item.check_in_time || '',
        check_in_method: item.check_in_method || 'manual',
        late_minutes: item.late_minutes,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ attendance_session_id: 0, student_id: 0, status: 'present', check_in_time: '', check_in_method: 'manual', late_minutes: 0, notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ attendance_session_id: 0, student_id: 0, status: 'present', check_in_time: '', check_in_method: 'manual', late_minutes: 0, notes: '' })
  }

  const handleSubmit = () => {
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<AttendanceRecord>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب' },
    { key: 'student_number', label: 'رقم الطالب' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          present: { label: 'حاضر', class: 'text-green-600' },
          absent: { label: 'غائب', class: 'text-red-600' },
          late: { label: 'متأخر', class: 'text-yellow-600' },
          excused: { label: 'معذر', class: 'text-blue-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    { key: 'check_in_time', label: 'وقت التسجيل' },
    { key: 'check_in_method', label: 'طريقة التسجيل' },
    { key: 'late_minutes', label: 'التأخير (دقيقة)' },
    { key: 'notes', label: 'ملاحظات' },
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
        title="سجلات الحضور"
        description="إدارة سجلات الحضور"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء سجل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن سجل..."
            id="attendance-records-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'سجلات الحضور')}
            onExportPDF={() => exportToPDF('attendance-records-table', 'سجلات الحضور')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف سجل', message: 'هل أنت متأكد من حذف هذا السجل؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد سجلات حضور بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل سجل الحضور' : 'إنشاء سجل حضور جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إنشاء'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">جلسة الحضور *</label>
            <SearchableSelect
              value={formData.attendance_session_id}
              onChange={(v) => setFormData({ ...formData, attendance_session_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الجلسة' },
                ...(sessions || []).map((s: any) => ({ value: s.id, label: `${s.subject_name || 'جلسة'} - ${s.session_date ? s.session_date.slice(0, 10) : ''}` })),
              ]}
              searchPlaceholder="بحث عن جلسة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الطالب *</label>
            <SearchableSelect
              value={formData.student_id}
              onChange={(v) => setFormData({ ...formData, student_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الطالب' },
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
                { value: 'present', label: 'حاضر' },
                { value: 'absent', label: 'غائب' },
                { value: 'late', label: 'متأخر' },
                { value: 'excused', label: 'معذر' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">طريقة التسجيل</label>
            <Select
              value={formData.check_in_method}
              onChange={(e) => setFormData({ ...formData, check_in_method: e.target.value })}
              options={[
                { value: 'manual', label: 'يدوي' },
                { value: 'qr', label: 'رمز QR' },
                { value: 'biometric', label: 'بصمة' },
                { value: 'face', label: 'تعرف على الوجه' },
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
          <div>
            <label className="block text-sm font-medium mb-1">دقائق التأخير</label>
            <Input
              type="number"
              value={formData.late_minutes}
              onChange={(e) => setFormData({ ...formData, late_minutes: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل الملاحظات"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
