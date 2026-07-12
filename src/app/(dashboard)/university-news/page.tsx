'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { universityNewsService } from '@/services/university-news.service'
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
import type { UniversityNews } from '@/types'

export default function UniversityNewsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<UniversityNews | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    summary: '',
    content: '',
    image: '',
    category: '',
    is_published: true,
  })

  const { data } = useQuery({
    queryKey: ['university-news'],
    queryFn: () => universityNewsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => universityNewsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-news'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => universityNewsService.update(editingNews!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-news'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => universityNewsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['university-news'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (news?: UniversityNews) => {
    if (news) {
      setEditingNews(news)
      setFormData({
        title: news.title,
        title_en: news.title_en || '',
        summary: news.summary || '',
        content: news.content || '',
        image: news.image || '',
        category: news.category || '',
        is_published: news.is_published,
      })
    } else {
      setEditingNews(null)
      setFormData({ title: '', title_en: '', summary: '', content: '', image: '', category: '', is_published: true })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingNews(null)
    setFormData({ title: '', title_en: '', summary: '', content: '', image: '', category: '', is_published: true })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingNews) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<UniversityNews>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'title_en', label: 'العنوان (إنجليزي)' },
    { key: 'category', label: 'التصنيف' },
    { key: 'summary', label: 'الملخص' },
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
        title="أخبار الجامعة"
        description="إدارة أخبار الجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة خبر
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن خبر..."
            id="university-news-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'أخبار الجامعة')}
            onExportPDF={() => exportToPDF('university-news-table', 'أخبار الجامعة')}
            actions={(news) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(news)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف خبر', message: 'هل أنت متأكد من حذف هذا الخبر؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(news.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد أخبار بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingNews ? 'حفظ التغييرات' : 'إضافة'}
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
                { value: 'academic', label: 'أكاديمي' },
                { value: 'administrative', label: 'إداري' },
                { value: 'events', label: 'فعاليات' },
                { value: 'announcements', label: 'إعلانات' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">صورة</label>
            <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="رابط الصورة" />
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
            <label className="block text-sm font-medium mb-1">الملخص</label>
            <Input value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="ملخص الخبر" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">المحتوى</label>
            <Input value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="محتوى الخبر" />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
