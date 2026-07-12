'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyLevelsService } from '@/services/study-levels.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { StudyLevel } from '@/types'

export default function StudyLevelsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<StudyLevel | null>(null)
  const [levelName, setLevelName] = useState('')

  const { data } = useQuery({
    queryKey: ['study-levels'],
    queryFn: () => studyLevelsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => studyLevelsService.create({ level_name: levelName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-levels'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => studyLevelsService.update(editingLevel!.id, { level_name: levelName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-levels'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studyLevelsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-levels'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (level?: StudyLevel) => {
    setEditingLevel(level || null)
    setLevelName(level?.level_name || '')
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingLevel(null)
    setLevelName('')
  }

  const handleSubmit = () => {
    if (!levelName.trim()) return
    if (editingLevel) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<StudyLevel>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'level_name', label: 'اسم المستوى', sortable: true },
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
        title="المستويات الدراسية"
        description="إدارة المستويات الدراسية في النظام"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مستوى
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مستوى..."
            id="study-levels-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المستويات_الدراسية')}
            onExportPDF={() => exportToPDF('study-levels-table', 'المستويات الدراسية')}
            actions={(level) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(level)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مستوى', message: 'هل أنت متأكد من حذف هذا المستوى؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(level.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مستويات دراسية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingLevel ? 'تعديل المستوى الدراسي' : 'إضافة مستوى دراسي جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingLevel ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المستوى</label>
            <Input
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              placeholder="أدخل اسم المستوى"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
