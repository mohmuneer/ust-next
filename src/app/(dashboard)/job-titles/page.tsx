'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobTitlesService } from '@/services/job-titles.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { JobTitle } from '@/types'

export default function JobTitlesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<JobTitle | null>(null)
  const [formData, setFormData] = useState({ title: '' })

  const { data } = useQuery({
    queryKey: ['job-titles'],
    queryFn: () => jobTitlesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => jobTitlesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => jobTitlesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-titles'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobTitlesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-titles'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: JobTitle) => {
    if (item) {
      setEditingItem(item)
      setFormData({ title: item.title })
    } else {
      setEditingItem(null)
      setFormData({ title: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ title: '' })
  }

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<JobTitle>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'المسمى الوظيفي', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (item) => formatDateTime(item.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="المسميات الوظيفية"
        description="إدارة المسميات الوظيفية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مسمى
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مسمى..."
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مسمى', message: 'هل أنت متأكد من حذف هذا المسمى الوظيفي؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مسميات وظيفية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل المسمى' : 'إضافة مسمى وظيفي جديد'}
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
            <label className="block text-sm font-medium mb-1">المسمى الوظيفي</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ title: e.target.value })}
              placeholder="أدخل المسمى الوظيفي..."
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
