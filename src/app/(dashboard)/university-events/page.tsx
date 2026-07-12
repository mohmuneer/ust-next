'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { universityEventsService } from '@/services/university-events.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { UniversityEvent } from '@/types'

export default function UniversityEventsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<UniversityEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    image: '',
    category: '',
    is_published: true,
  })

  const { data } = useQuery({
    queryKey: ['university-events'],
    queryFn: () => universityEventsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => universityEventsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-events'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => universityEventsService.update(editingEvent!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-events'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => universityEventsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['university-events'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (event?: UniversityEvent) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        title_en: event.title_en || '',
        description: event.description || '',
        event_date: event.event_date ? event.event_date.slice(0, 10) : '',
        event_time: event.event_time || '',
        location: event.location || '',
        image: event.image || '',
        category: event.category || '',
        is_published: event.is_published,
      })
    } else {
      setEditingEvent(null)
      setFormData({ title: '', title_en: '', description: '', event_date: '', event_time: '', location: '', image: '', category: '', is_published: true })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setFormData({ title: '', title_en: '', description: '', event_date: '', event_time: '', location: '', image: '', category: '', is_published: true })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingEvent) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<UniversityEvent>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'title_en', label: 'العنوان (إنجليزي)' },
    { key: 'category', label: 'التصنيف' },
    {
      key: 'event_date', label: 'التاريخ',
      render: (e) => e.event_date ? e.event_date.slice(0, 10) : '---',
    },
    { key: 'event_time', label: 'الوقت' },
    { key: 'location', label: 'المكان' },
    {
      key: 'is_published', label: 'منشور',
      render: (e) => (
        <span className={e.is_published ? 'text-green-600' : 'text-yellow-600'}>
          {e.is_published ? 'منشور' : 'مسودة'}
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
        title="فعاليات الجامعة"
        description="إدارة فعاليات الجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة فعالية
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن فعالية..."
            id="university-events-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'فعاليات الجامعة')}
            onExportPDF={() => exportToPDF('university-events-table', 'فعاليات الجامعة')}
            actions={(event) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(event)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف فعالية', message: 'هل أنت متأكد من حذف هذه الفعالية؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(event.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد فعاليات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingEvent ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
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
          <div>
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="أدخل العنوان" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان (إنجليزي)</label>
            <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="English title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: '', label: 'بدون تصنيف' },
                { value: 'conference', label: 'مؤتمر' },
                { value: 'workshop', label: 'ورشة عمل' },
                { value: 'seminar', label: 'ندوة' },
                { value: 'cultural', label: 'ثقافي' },
                { value: 'sports', label: 'رياضي' },
                { value: 'other', label: 'أخرى' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">حالة النشر</label>
            <Select
              value={formData.is_published ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.value === '1' })}
              options={[
                { value: '1', label: 'منشور' },
                { value: '0', label: 'مسودة' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ</label>
            <Input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوقت</label>
            <Input type="time" value={formData.event_time} onChange={(e) => setFormData({ ...formData, event_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المكان</label>
            <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="أدخل المكان" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">صورة</label>
            <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="رابط الصورة" />
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
