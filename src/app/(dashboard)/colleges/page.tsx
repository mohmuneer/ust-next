'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collegesService } from '@/services/colleges.service'
import { branchesService } from '@/services/branches.service'
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
import type { College, Branch } from '@/types'

export default function CollegesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [formData, setFormData] = useState({ college_name: '', branch_id: 0 })

  const { data } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => collegesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => collegesService.update(editingCollege!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => collegesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colleges'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (college?: College) => {
    if (college) {
      setEditingCollege(college)
      setFormData({ college_name: college.college_name, branch_id: college.branch_id })
    } else {
      setEditingCollege(null)
      setFormData({ college_name: '', branch_id: branches?.[0]?.id || 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingCollege(null)
    setFormData({ college_name: '', branch_id: 0 })
  }

  const handleSubmit = () => {
    if (editingCollege) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<College>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'college_name', label: 'اسم الكلية', sortable: true },
    { key: 'branch_name', label: 'الفرع', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (c) => formatDateTime(c.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الكليات"
        description="إدارة كليات الجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة كلية
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن كلية..."
            actions={(college) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(college)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف كلية', message: 'هل أنت متأكد من حذف هذه الكلية؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(college.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد كليات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingCollege ? 'تعديل الكلية' : 'إضافة كلية جديدة'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingCollege ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الكلية</label>
            <Input
              value={formData.college_name}
              onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              placeholder="أدخل اسم الكلية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الفرع</label>
            <Select
              value={String(formData.branch_id)}
              onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
              placeholder="اختر الفرع"
              options={(branches || []).map((b: Branch) => ({ value: b.id, label: b.branch_name }))}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
