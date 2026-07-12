'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobOpeningsService } from '@/services/job-openings.service'
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
import type { JobOpening } from '@/types'

export default function JobOpeningsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    department: '',
    job_type: 'full_time',
    description: '',
    requirements: '',
    salary_range: '',
    application_deadline: '',
    is_published: true,
  })

  const { data } = useQuery({
    queryKey: ['job-openings'],
    queryFn: () => jobOpeningsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => jobOpeningsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => jobOpeningsService.update(editingJob!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobOpeningsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-openings'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (job?: JobOpening) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title,
        title_en: job.title_en || '',
        department: job.department || '',
        job_type: job.job_type,
        description: job.description || '',
        requirements: job.requirements || '',
        salary_range: job.salary_range || '',
        application_deadline: job.application_deadline ? job.application_deadline.slice(0, 10) : '',
        is_published: job.is_published,
      })
    } else {
      setEditingJob(null)
      setFormData({ title: '', title_en: '', department: '', job_type: 'full_time', description: '', requirements: '', salary_range: '', application_deadline: '', is_published: true })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingJob(null)
    setFormData({ title: '', title_en: '', department: '', job_type: 'full_time', description: '', requirements: '', salary_range: '', application_deadline: '', is_published: true })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingJob) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<JobOpening>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'المسمى الوظيفي', sortable: true },
    { key: 'title_en', label: 'المسمى (إنجليزي)' },
    { key: 'department', label: 'القسم' },
    { key: 'job_type', label: 'نوع الوظيفة' },
    { key: 'salary_range', label: 'الراتب' },
    {
      key: 'application_deadline', label: 'آخر موعد',
      render: (e) => e.application_deadline ? e.application_deadline.slice(0, 10) : '---',
    },
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
        title="الوظائف"
        description="إدارة الوظائف الشاغرة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة وظيفة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن وظيفة..."
            id="job-openings-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الوظائف')}
            onExportPDF={() => exportToPDF('job-openings-table', 'الوظائف')}
            actions={(job) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(job)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف وظيفة', message: 'هل أنت متأكد من حذف هذه الوظيفة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(job.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد وظائف بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingJob ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingJob ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">المسمى الوظيفي *</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="أدخل المسمى" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المسمى (إنجليزي)</label>
            <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="English title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم</label>
            <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="أدخل القسم" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الوظيفة</label>
            <Select
              value={formData.job_type}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              options={[
                { value: 'full_time', label: 'دوام كامل' },
                { value: 'part_time', label: 'دوام جزئي' },
                { value: 'contract', label: 'عقد' },
                { value: 'temporary', label: 'مؤقت' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الراتب</label>
            <Input value={formData.salary_range} onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })} placeholder="مثال: 5000-8000 ريال" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">آخر موعد للتقديم</label>
            <Input type="date" value={formData.application_deadline} onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })} />
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="أدخل وصف الوظيفة" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">المتطلبات</label>
            <Input value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder="أدخل متطلبات الوظيفة" />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
