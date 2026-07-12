'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { defaultProblemsService } from '@/services/default-problems.service'
import { problemGroupsService } from '@/services/problem-groups.service'
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
import type { DefaultProblem, ProblemGroup } from '@/types'

export default function DefaultProblemsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<DefaultProblem | null>(null)
  const [formData, setFormData] = useState({ problem_name: '', group_id: 0 })

  const { data } = useQuery({
    queryKey: ['default-problems'],
    queryFn: () => defaultProblemsService.getAll(),
  })

  const { data: groups } = useQuery({
    queryKey: ['problem-groups'],
    queryFn: () => problemGroupsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => defaultProblemsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-problems'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => defaultProblemsService.update(editingProblem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-problems'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => defaultProblemsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['default-problems'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (problem?: DefaultProblem) => {
    if (problem) {
      setEditingProblem(problem)
      setFormData({ problem_name: problem.problem_name, group_id: problem.group_id })
    } else {
      setEditingProblem(null)
      setFormData({ problem_name: '', group_id: groups?.[0]?.id || 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingProblem(null)
    setFormData({ problem_name: '', group_id: 0 })
  }

  const handleSubmit = () => {
    if (editingProblem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<DefaultProblem>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'problem_name', label: 'اسم المشكلة', sortable: true },
    { key: 'group_name', label: 'التصنيف', sortable: true },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (p) => formatDateTime(p.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="المشاكل الافتراضية"
        description="إدارة المشاكل الافتراضية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مشكلة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مشكلة..."
            actions={(problem) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(problem)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مشكلة', message: 'هل أنت متأكد من حذف هذه المشكلة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(problem.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مشاكل افتراضية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingProblem ? 'تعديل المشكلة' : 'إضافة مشكلة جديدة'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingProblem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المشكلة</label>
            <Input
              value={formData.problem_name}
              onChange={(e) => setFormData({ ...formData, problem_name: e.target.value })}
              placeholder="أدخل اسم المشكلة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <Select
              value={String(formData.group_id)}
              onChange={(e) => setFormData({ ...formData, group_id: Number(e.target.value) })}
              placeholder="اختر التصنيف"
              options={(groups || []).map((g: ProblemGroup) => ({ value: g.id, label: g.group_name }))}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
