'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyGroupsService } from '@/services/study-groups.service'
import { collegesService } from '@/services/colleges.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { StudyGroup, College } from '@/types'

const groupTypes = [
  { value: 'نظري', label: 'نظري' },
  { value: 'عملي', label: 'عملي' },
]

export default function StudyGroupsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StudyGroup | null>(null)
  const [formData, setFormData] = useState({ group_name: '', group_type: 'نظري' as string, college_id: 0 })

  const { data } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => studyGroupsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => studyGroupsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => studyGroupsService.update(editingGroup!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studyGroupsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-groups'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (group?: StudyGroup) => {
    if (group) {
      setEditingGroup(group)
      setFormData({ group_name: group.group_name, group_type: group.group_type, college_id: group.college_id || 0 })
    } else {
      setEditingGroup(null)
      setFormData({ group_name: '', group_type: 'نظري', college_id: 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingGroup(null)
    setFormData({ group_name: '', group_type: 'نظري', college_id: 0 })
  }

  const handleSubmit = () => {
    if (!formData.group_name.trim()) return
    if (editingGroup) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<StudyGroup>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'group_name', label: 'اسم المجموعة', sortable: true },
    {
      key: 'group_type', label: 'النوع', sortable: true,
      render: (g) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          g.group_type === 'عملي' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          <BookOpen className="h-3 w-3" />
          {g.group_type}
        </span>
      ),
    },
    { key: 'college_name', label: 'الكلية', sortable: true },
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
        title="المجموعات الدراسية"
        description="إدارة المجموعات الدراسية (نظري / عملي)"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مجموعة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مجموعة..."
            id="study-groups-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المجموعات_الدراسية')}
            onExportPDF={() => exportToPDF('study-groups-table', 'المجموعات الدراسية')}
            actions={(group) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(group)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مجموعة', message: 'هل أنت متأكد من حذف هذه المجموعة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(group.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مجموعات دراسية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingGroup ? 'تعديل المجموعة الدراسية' : 'إضافة مجموعة دراسية جديدة'}
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
            <label className="block text-sm font-medium mb-1">اسم المجموعة</label>
            <Input
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              placeholder="أدخل اسم المجموعة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">النوع</label>
            <Select
              value={formData.group_type}
              onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
              placeholder="اختر النوع"
              options={groupTypes}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <Select
              value={String(formData.college_id)}
              onChange={(e) => setFormData({ ...formData, college_id: Number(e.target.value) })}
              placeholder="اختر الكلية (اختياري)"
              options={(colleges || []).map((c: College) => ({ value: c.id, label: c.college_name }))}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
