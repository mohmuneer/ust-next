'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/services/documents.service'
import { documentCategoriesService } from '@/services/document-categories.service'
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
import type { Document } from '@/types'

export default function DocumentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Document | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 0,
    document_type: '',
    entity_type: '',
    tags: '',
    is_archived: false,
    is_confidential: false,
  })

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsService.getAll(),
  })

  const { data: categories } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentCategoriesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => documentsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => documentsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: Document) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        description: item.description || '',
        category_id: item.category_id || 0,
        document_type: item.document_type || '',
        entity_type: item.entity_type || '',
        tags: item.tags || '',
        is_archived: item.is_archived,
        is_confidential: item.is_confidential,
      })
    } else {
      setEditingItem(null)
      setFormData({ title: '', description: '', category_id: 0, document_type: '', entity_type: '', tags: '', is_archived: false, is_confidential: false })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ title: '', description: '', category_id: 0, document_type: '', entity_type: '', tags: '', is_archived: false, is_confidential: false })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Document>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'category_name', label: 'التصنيف' },
    { key: 'document_type', label: 'نوع المستند' },
    {
      key: 'file_size', label: 'حجم الملف',
      render: (e) => e.file_size ? `${(e.file_size / 1024).toFixed(1)} KB` : '---',
    },
    {
      key: 'is_archived', label: 'مؤرشف',
      render: (e) => e.is_archived ? 'نعم' : 'لا',
    },
    {
      key: 'is_confidential', label: 'سري',
      render: (e) => e.is_confidential ? 'نعم' : 'لا',
    },
    { key: 'uploader_name', label: 'رفع بواسطة' },
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
        title="المستندات"
        description="إدارة المستندات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مستند
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مستند..."
            id="documents-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المستندات')}
            onExportPDF={() => exportToPDF('documents-table', 'المستندات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مستند', message: 'هل أنت متأكد من حذف هذا المستند؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مستندات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل المستند' : 'إضافة مستند جديد'}
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
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان المستند"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف المستند"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <SearchableSelect
              value={formData.category_id}
              onChange={(v) => setFormData({ ...formData, category_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون تصنيف' },
                ...(categories || []).map((s: any) => ({ value: s.id, label: s.category_name })),
              ]}
              searchPlaceholder="بحث عن تصنيف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المستند</label>
            <Select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              options={[
                { value: '', label: 'اختر النوع' },
                { value: 'pdf', label: 'PDF' },
                { value: 'doc', label: 'Word' },
                { value: 'image', label: 'صورة' },
                { value: 'spreadsheet', label: 'جدول بيانات' },
                { value: 'other', label: 'آخر' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الكيان</label>
            <Input
              value={formData.entity_type}
              onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
              placeholder="نوع الكيان المرتبط"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوسوم</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="وسوم مفصولة بفواصل"
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_archived}
                onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
              />
              <span className="text-sm font-medium">مؤرشف</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_confidential}
                onChange={(e) => setFormData({ ...formData, is_confidential: e.target.checked })}
              />
              <span className="text-sm font-medium">سري</span>
            </label>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
