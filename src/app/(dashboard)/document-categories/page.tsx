'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentCategoriesService } from '@/services/document-categories.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { DocumentCategory } from '@/types'

export default function DocumentCategoriesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DocumentCategory | null>(null)
  const [formData, setFormData] = useState({
    category_name: '',
    parent_id: 0,
    sort_order: 0,
  })

  const { data } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentCategoriesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => documentCategoriesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => documentCategoriesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentCategoriesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document-categories'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: DocumentCategory) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        category_name: item.category_name,
        parent_id: item.parent_id || 0,
        sort_order: item.sort_order,
      })
    } else {
      setEditingItem(null)
      setFormData({ category_name: '', parent_id: 0, sort_order: 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ category_name: '', parent_id: 0, sort_order: 0 })
  }

  const handleSubmit = () => {
    if (!formData.category_name.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<DocumentCategory>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'category_name', label: 'اسم التصنيف', sortable: true },
    { key: 'parent_name', label: 'التصنيف الأب' },
    { key: 'sort_order', label: 'ترتيب الفرز' },
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
        title="تصنيفات المستندات"
        description="إدارة تصنيفات المستندات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة تصنيف
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن تصنيف..."
            id="document-categories-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'تصنيفات المستندات')}
            onExportPDF={() => exportToPDF('document-categories-table', 'تصنيفات المستندات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف تصنيف', message: 'هل أنت متأكد من حذف هذا التصنيف؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد تصنيفات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        size="default"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم التصنيف *</label>
            <Input
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
              placeholder="أدخل اسم التصنيف"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف الأب</label>
            <SearchableSelect
              value={formData.parent_id}
              onChange={(v) => setFormData({ ...formData, parent_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون تصنيف أب' },
                ...(data || []).map((s) => ({ value: s.id, label: s.category_name })),
              ]}
              searchPlaceholder="بحث عن تصنيف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ترتيب الفرز</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
