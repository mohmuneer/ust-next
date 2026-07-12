'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceSessionsService } from '@/services/attendance-sessions.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { employeesService } from '@/services/employees.service'
import { studySchedulesService } from '@/services/study-schedules.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
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
import type { AttendanceSession } from '@/types'

export default function AttendanceSessionsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AttendanceSession | null>(null)
  const [formData, setFormData] = useState({
    lecture_id: 0,
    study_schedule_id: 0,
    study_subject_id: 0,
    employee_id: 0,
    session_date: '',
    start_time: '',
    end_time: '',
    session_type: 'lecture',
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['attendance-sessions'],
    queryFn: () => attendanceSessionsService.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const { data: schedules } = useQuery({
    queryKey: ['study-schedules'],
    queryFn: () => studySchedulesService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => attendanceSessionsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => attendanceSessionsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attendanceSessionsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: AttendanceSession) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        lecture_id: item.lecture_id || 0,
        study_schedule_id: item.study_schedule_id || 0,
        study_subject_id: item.study_subject_id || 0,
        employee_id: item.employee_id || 0,
        session_date: item.session_date ? item.session_date.slice(0, 10) : '',
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        session_type: item.session_type,
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ lecture_id: 0, study_schedule_id: 0, study_subject_id: 0, employee_id: 0, session_date: '', start_time: '', end_time: '', session_type: 'lecture', status: 'active', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ lecture_id: 0, study_schedule_id: 0, study_subject_id: 0, employee_id: 0, session_date: '', start_time: '', end_time: '', session_type: 'lecture', status: 'active', notes: '' })
  }

  const handleSubmit = () => {
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<AttendanceSession>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'subject_name', label: 'المادة' },
    { key: 'employee_name', label: 'الموظف' },
    { key: 'session_date', label: 'التاريخ', render: (e) => e.session_date ? e.session_date.slice(0, 10) : '---' },
    { key: 'start_time', label: 'وقت البداية' },
    { key: 'end_time', label: 'وقت النهاية' },
    { key: 'session_type', label: 'النوع' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-green-600' },
          cancelled: { label: 'ملغى', class: 'text-red-600' },
          completed: { label: 'مكتمل', class: 'text-blue-600' },
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
        title="جلسات الحضور"
        description="إدارة جلسات الحضور"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء جلسة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن جلسة..."
            id="attendance-sessions-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'جلسات الحضور')}
            onExportPDF={() => exportToPDF('attendance-sessions-table', 'جلسات الحضور')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف جلسة', message: 'هل أنت متأكد من حذف هذه الجلسة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد جلسات حضور بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل جلسة الحضور' : 'إنشاء جلسة حضور جديدة'}
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
            <label className="block text-sm font-medium mb-1">المادة</label>
            <SearchableSelect
              value={formData.study_subject_id}
              onChange={(v) => setFormData({ ...formData, study_subject_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر المادة' },
                ...(subjects || []).map((s: any) => ({ value: s.id, label: s.subject_name })),
              ]}
              searchPlaceholder="بحث عن مادة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الموظف</label>
            <SearchableSelect
              value={formData.employee_id}
              onChange={(v) => setFormData({ ...formData, employee_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الموظف' },
                ...(employees || []).map((e: any) => ({ value: e.id, label: e.full_name })),
              ]}
              searchPlaceholder="بحث عن موظف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الجدول الدراسي</label>
            <SearchableSelect
              value={formData.study_schedule_id}
              onChange={(v) => setFormData({ ...formData, study_schedule_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الجدول' },
                ...(schedules || []).map((s: any) => ({ value: s.id, label: s.subject_name || `جدول ${s.id}` })),
              ]}
              searchPlaceholder="بحث..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الجلسة</label>
            <Select
              value={formData.session_type}
              onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
              options={[
                { value: 'lecture', label: 'محاضرة' },
                { value: 'lab', label: 'مختبر' },
                { value: 'exam', label: 'اختبار' },
                { value: 'workshop', label: 'ورشة' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ</label>
            <Input
              type="date"
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت البداية</label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت النهاية</label>
            <Input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'cancelled', label: 'ملغى' },
              ]}
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
