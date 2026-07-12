'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicCalendarService } from '@/services/academic-calendar.service'
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
import type { AcademicCalendarEvent } from '@/types'

export default function AcademicCalendarPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    academic_semester_id: 0,
    event_date: '',
    event_type: 'event',
    event_title: '',
    event_title_en: '',
    description: '',
    is_holiday: false,
  })

  const { data } = useQuery({
    queryKey: ['academic-calendar'],
    queryFn: () => academicCalendarService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => academicCalendarService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-calendar'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => academicCalendarService.update(editingEvent!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-calendar'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => academicCalendarService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-calendar'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (event?: AcademicCalendarEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        academic_semester_id: event.academic_semester_id,
        event_date: event.event_date ? event.event_date.slice(0, 10) : '',
        event_type: event.event_type,
        event_title: event.event_title,
        event_title_en: event.event_title_en || '',
        description: event.description || '',
        is_holiday: event.is_holiday,
      })
    } else {
      setEditingEvent(null)
      setFormData({ academic_semester_id: 0, event_date: '', event_type: 'event', event_title: '', event_title_en: '', description: '', is_holiday: false })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setFormData({ academic_semester_id: 0, event_date: '', event_type: 'event', event_title: '', event_title_en: '', description: '', is_holiday: false })
  }

  const handleSubmit = () => {
    if (!formData.academic_semester_id || !formData.event_date || !formData.event_title.trim()) return
    if (editingEvent) updateMutation.mutate()
    else createMutation.mutate()
  }

  const eventTypeLabels: Record<string, string> = {
    registration_start: 'بدء التسجيل',
    registration_end: 'نهاية التسجيل',
    classes_start: 'بدء المحاضرات',
    classes_end: 'نهاية المحاضرات',
    exams_start: 'بدء الاختبارات',
    exams_end: 'نهاية الاختبارات',
    holiday: 'عطلة',
    event: 'فعالية',
  }

  const columns: Column<AcademicCalendarEvent>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'semester_name', label: 'الفصل الدراسي' },
    {
      key: 'event_date', label: 'التاريخ',
      sortable: true,
      render: (e) => e.event_date ? e.event_date.slice(0, 10) : '---',
    },
    {
      key: 'event_type', label: 'النوع',
      render: (e) => eventTypeLabels[e.event_type] || e.event_type,
    },
    { key: 'event_title', label: 'العنوان', sortable: true },
    {
      key: 'is_holiday', label: 'عطلة',
      render: (e) => (
        <span className={e.is_holiday ? 'text-red-600' : 'text-gray-600'}>
          {e.is_holiday ? 'عطلة' : '---'}
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
        title="التقويم الأكاديمي"
        description="إدارة أحداث التقويم الأكاديمي"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة حدث
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن حدث..."
            id="academic-calendar-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'التقويم الأكاديمي')}
            onExportPDF={() => exportToPDF('academic-calendar-table', 'التقويم الأكاديمي')}
            actions={(event) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(event)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف حدث', message: 'هل أنت متأكد من حذف هذا الحدث؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(event.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد أحداث تقويمية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingEvent ? 'تعديل الحدث' : 'إضافة حدث جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingEvent ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الفصل الدراسي *</label>
            <SearchableSelect
              value={formData.academic_semester_id}
              onChange={(v) => setFormData({ ...formData, academic_semester_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر فصلاً' },
                ...(semesters || []).map((s: any) => ({ value: s.id, label: s.semester_name })),
              ]}
              searchPlaceholder="بحث عن فصل..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ *</label>
            <Input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الحدث</label>
            <Select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              options={[
                { value: 'registration_start', label: 'بدء التسجيل' },
                { value: 'registration_end', label: 'نهاية التسجيل' },
                { value: 'classes_start', label: 'بدء المحاضرات' },
                { value: 'classes_end', label: 'نهاية المحاضرات' },
                { value: 'exams_start', label: 'بدء الاختبارات' },
                { value: 'exams_end', label: 'نهاية الاختبارات' },
                { value: 'holiday', label: 'عطلة' },
                { value: 'event', label: 'فعالية' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <Input value={formData.event_title} onChange={(e) => setFormData({ ...formData, event_title: e.target.value })} placeholder="أدخل العنوان" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان (إنجليزي)</label>
            <Input value={formData.event_title_en} onChange={(e) => setFormData({ ...formData, event_title_en: e.target.value })} placeholder="English title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">عطلة</label>
            <Select
              value={formData.is_holiday ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, is_holiday: e.target.value === '1' })}
              options={[
                { value: '1', label: 'عطلة' },
                { value: '0', label: 'يوم عادي' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="أدخل الوصف" />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
