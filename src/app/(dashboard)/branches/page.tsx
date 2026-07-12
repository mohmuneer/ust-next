'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { branchesService } from '@/services/branches.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Branch } from '@/types'

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({ branch_name: '' })

  const { data } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => branchesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => branchesService.update(editingBranch!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => branchesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({ branch_name: branch.branch_name })
    } else {
      setEditingBranch(null)
      setFormData({ branch_name: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingBranch(null)
    setFormData({ branch_name: '' })
  }

  const handleSubmit = () => {
    if (editingBranch) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<Branch>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'branch_name', label: 'اسم الفرع', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (b) => formatDateTime(b.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الفروع"
        description="إدارة فروع الجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة فرع
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن فرع..."
            actions={(branch) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(branch)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف فرع', message: 'هل أنت متأكد من حذف هذا الفرع؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(branch.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد فروع بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingBranch ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الفرع</label>
            <Input
              value={formData.branch_name}
              onChange={(e) => setFormData({ branch_name: e.target.value })}
              placeholder="أدخل اسم الفرع"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
