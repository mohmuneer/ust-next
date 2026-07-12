'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timeSlotsService } from '@/services/time-slots.service'
import { collegesService } from '@/services/colleges.service'
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
import type { TimeSlot } from '@/types'

export default function TimeSlotsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    slot_name: '',
    day_of_week: 0,
    start_time: '',
    end_time: '',
    slot_type: 'lecture',
    college_id: 0,
    is_active: true,
  })

  const { data } = useQuery({
    queryKey: ['time-slots'],
    queryFn: () => timeSlotsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => timeSlotsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => timeSlotsService.update(editingSlot!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => timeSlotsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-slots'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (slot?: TimeSlot) => {
    if (slot) {
      setEditingSlot(slot)
      setFormData({
        slot_name: slot.slot_name || '',
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        slot_type: slot.slot_type,
        college_id: slot.college_id || 0,
        is_active: slot.is_active,
      })
    } else {
      setEditingSlot(null)
      setFormData({ slot_name: '', day_of_week: 0, start_time: '', end_time: '', slot_type: 'lecture', college_id: 0, is_active: true })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingSlot(null)
    setFormData({ slot_name: '', day_of_week: 0, start_time: '', end_time: '', slot_type: 'lecture', college_id: 0, is_active: true })
  }

  const handleSubmit = () => {
    if (!formData.start_time || !formData.end_time) return
    if (editingSlot) updateMutation.mutate()
    else createMutation.mutate()
  }

  const dayNames: Record<number, string> = {
    0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
    4: 'الخميس', 5: 'الجمعة', 6: 'السبت',
  }

  const columns: Column<TimeSlot>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'slot_name', label: 'اسم الفترة', sortable: true },
    {
      key: 'day_of_week', label: 'اليوم',
      render: (e) => dayNames[e.day_of_week] || e.day_of_week,
    },
    { key: 'start_time', label: 'وقت البداية' },
    { key: 'end_time', label: 'وقت النهاية' },
    { key: 'slot_type', label: 'النوع' },
    { key: 'college_name', label: 'الكلية' },
    {
      key: 'is_active', label: 'نشط',
      render: (e) => (
        <span className={e.is_active ? 'text-green-600' : 'text-red-600'}>
          {e.is_active ? 'نشط' : 'غير نشط'}
        </span>
      ),
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
        title="الفترات الزمنية"
        description="إدارة الفترات الزمنية للجدول"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة فترة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن فترة..."
            id="time-slots-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الفترات الزمنية')}
            onExportPDF={() => exportToPDF('time-slots-table', 'الفترات الزمنية')}
            actions={(slot) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(slot)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف فترة', message: 'هل أنت متأكد من حذف هذه الفترة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(slot.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد فترات زمنية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingSlot ? 'تعديل الفترة' : 'إضافة فترة جديدة'}
        size="default"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingSlot ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الفترة</label>
            <Input value={formData.slot_name} onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })} placeholder="أدخل اسم الفترة" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اليوم</label>
            <Select
              value={String(formData.day_of_week)}
              onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
              options={[
                { value: '0', label: 'الأحد' },
                { value: '1', label: 'الإثنين' },
                { value: '2', label: 'الثلاثاء' },
                { value: '3', label: 'الأربعاء' },
                { value: '4', label: 'الخميس' },
                { value: '5', label: 'الجمعة' },
                { value: '6', label: 'السبت' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت البداية *</label>
            <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">وقت النهاية *</label>
            <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">النوع</label>
            <Select
              value={formData.slot_type}
              onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
              options={[
                { value: 'lecture', label: 'محاضرة' },
                { value: 'lab', label: 'مختبر' },
                { value: 'break', label: 'استراحة' },
                { value: 'exam', label: 'اختبار' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <SearchableSelect
              value={formData.college_id}
              onChange={(v) => setFormData({ ...formData, college_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون كلية' },
                ...(colleges || []).map((c: any) => ({ value: c.id, label: c.college_name })),
              ]}
              searchPlaceholder="بحث عن كلية..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.is_active ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
              options={[
                { value: '1', label: 'نشط' },
                { value: '0', label: 'غير نشط' },
              ]}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
