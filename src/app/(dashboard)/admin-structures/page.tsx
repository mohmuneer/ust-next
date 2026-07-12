'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminStructuresService } from '@/services/admin-structures.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { AdminStructure } from '@/types'

export default function AdminStructuresPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AdminStructure | null>(null)
  const [formData, setFormData] = useState({ name: '', parent_id: 0, sort_order: 0 })

  const { data } = useQuery({
    queryKey: ['admin-structures'],
    queryFn: () => adminStructuresService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => adminStructuresService.create({
      name: formData.name,
      parent_id: formData.parent_id || null,
      sort_order: formData.sort_order,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-structures'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => adminStructuresService.update(editingItem!.id, {
      name: formData.name,
      parent_id: formData.parent_id || null,
      sort_order: formData.sort_order,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-structures'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminStructuresService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-structures'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: AdminStructure) => {
    if (item) {
      setEditingItem(item)
      setFormData({ name: item.name, parent_id: item.parent_id || 0, sort_order: item.sort_order })
    } else {
      setEditingItem(null)
      setFormData({ name: '', parent_id: 0, sort_order: (data || []).length + 1 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ name: '', parent_id: 0, sort_order: 0 })
  }

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<AdminStructure>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'اسم الهيكل', sortable: true },
    { key: 'sort_order', label: 'الترتيب', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (item) => formatDateTime(item.created_at!),
    },
  ]

  const parentOptions = (data || [])
    .filter((s) => s.id !== editingItem?.id)
    .map((s) => ({ value: s.id, label: s.name }))

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الهيكل الإداري"
        description="إدارة الهياكل الإدارية للجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة هيكل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن هيكل..."
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف هيكل', message: 'هل أنت متأكد من حذف هذا الهيكل الإداري؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد هياكل إدارية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الهيكل' : 'إضافة هيكل إداري جديد'}
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
            <label className="block text-sm font-medium mb-1">اسم الهيكل</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم الهيكل..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الهيكل الأب</label>
            <Select
              value={String(formData.parent_id)}
              onChange={(e) => setFormData({ ...formData, parent_id: Number(e.target.value) })}
              placeholder="أعلى هيكل"
              options={parentOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الترتيب</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              className="w-24"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
