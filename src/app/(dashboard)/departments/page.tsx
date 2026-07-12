'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsService } from '@/services/departments.service'
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
import type { Department, College } from '@/types'

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ department_name: '', college_id: 0 })

  const { data } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => departmentsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => departmentsService.update(editingDept!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept)
      setFormData({ department_name: dept.department_name, college_id: dept.college_id })
    } else {
      setEditingDept(null)
      setFormData({ department_name: '', college_id: colleges?.[0]?.id || 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingDept(null)
    setFormData({ department_name: '', college_id: 0 })
  }

  const handleSubmit = () => {
    if (editingDept) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<Department>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'department_name', label: 'اسم القسم', sortable: true },
    { key: 'college_name', label: 'الكلية', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (d) => formatDateTime(d.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الأقسام"
        description="إدارة الأقسام الأكاديمية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة قسم
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن قسم..."
            actions={(dept) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(dept)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف قسم', message: 'هل أنت متأكد من حذف هذا القسم؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(dept.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد أقسام بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingDept ? 'تعديل القسم' : 'إضافة قسم جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingDept ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم القسم</label>
            <Input
              value={formData.department_name}
              onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
              placeholder="أدخل اسم القسم"
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
