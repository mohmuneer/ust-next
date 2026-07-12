'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { labsService } from '@/services/labs.service'
import { collegesService } from '@/services/colleges.service'
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
import type { Lab, College } from '@/types'

export default function LabsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [formData, setFormData] = useState({ lab_name: '', college_id: 0 })

  const { data } = useQuery({
    queryKey: ['labs'],
    queryFn: () => labsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => labsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => labsService.update(editingLab!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => labsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labs'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (lab?: Lab) => {
    if (lab) {
      setEditingLab(lab)
      setFormData({ lab_name: lab.lab_name, college_id: lab.college_id })
    } else {
      setEditingLab(null)
      setFormData({ lab_name: '', college_id: colleges?.[0]?.id || 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingLab(null)
    setFormData({ lab_name: '', college_id: 0 })
  }

  const handleSubmit = () => {
    if (editingLab) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<Lab>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'lab_name', label: 'اسم المعمل', sortable: true },
    { key: 'college_name', label: 'الكلية', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (l) => formatDateTime(l.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="المعامل"
        description="إدارة معامل الكلية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة معمل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن معمل..."
            actions={(lab) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(lab)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف معمل', message: 'هل أنت متأكد من حذف هذا المعمل؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(lab.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد معامل بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingLab ? 'تعديل المعمل' : 'إضافة معمل جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingLab ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المعمل</label>
            <Input
              value={formData.lab_name}
              onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
              placeholder="أدخل اسم المعمل"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <Select
              value={String(formData.college_id)}
              onChange={(e) => setFormData({ ...formData, college_id: Number(e.target.value) })}
              placeholder="اختر الكلية"
              options={(colleges || []).map((c: College) => ({ value: c.id, label: c.college_name }))}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
