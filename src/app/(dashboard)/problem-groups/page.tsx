'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { problemGroupsService } from '@/services/problem-groups.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { ProblemGroup } from '@/types'

export default function ProblemGroupsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ProblemGroup | null>(null)
  const [formData, setFormData] = useState({ group_name: '' })

  const { data } = useQuery({
    queryKey: ['problem-groups'],
    queryFn: () => problemGroupsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => problemGroupsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-groups'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => problemGroupsService.update(editingGroup!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-groups'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => problemGroupsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problem-groups'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (group?: ProblemGroup) => {
    if (group) {
      setEditingGroup(group)
      setFormData({ group_name: group.group_name })
    } else {
      setEditingGroup(null)
      setFormData({ group_name: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingGroup(null)
    setFormData({ group_name: '' })
  }

  const handleSubmit = () => {
    if (editingGroup) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<ProblemGroup>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'group_name', label: 'اسم التصنيف', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (g) => formatDateTime(g.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="تصنيفات المشاكل"
        description="إدارة تصنيفات المشاكل"
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
            actions={(group) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(group)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف تصنيف', message: 'هل أنت متأكد من حذف هذا التصنيف؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(group.id)
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
        title={editingGroup ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingGroup ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم التصنيف</label>
            <Input
              value={formData.group_name}
              onChange={(e) => setFormData({ group_name: e.target.value })}
              placeholder="أدخل اسم التصنيف..."
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
