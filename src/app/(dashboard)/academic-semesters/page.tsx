'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { AcademicSemester } from '@/types'

export default function AcademicSemestersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<AcademicSemester | null>(null)
  const [formData, setFormData] = useState({
    semester_name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })

  const { data } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => academicSemestersService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-semesters'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => academicSemestersService.update(editingSemester!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-semesters'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => academicSemestersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-semesters'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (semester?: AcademicSemester) => {
    if (semester) {
      setEditingSemester(semester)
      setFormData({
        semester_name: semester.semester_name,
        start_date: semester.start_date ? semester.start_date.slice(0, 10) : '',
        end_date: semester.end_date ? semester.end_date.slice(0, 10) : '',
        is_current: semester.is_current,
      })
    } else {
      setEditingSemester(null)
      setFormData({ semester_name: '', start_date: '', end_date: '', is_current: false })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingSemester(null)
    setFormData({ semester_name: '', start_date: '', end_date: '', is_current: false })
  }

  const handleSubmit = () => {
    if (!formData.semester_name.trim()) return
    if (editingSemester) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<AcademicSemester>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'semester_name', label: 'اسم الترم', sortable: true },
    {
      key: 'start_date', label: 'تاريخ البداية', sortable: true,
      render: (s) => s.start_date ? formatDateTime(s.start_date) : '---',
    },
    {
      key: 'end_date', label: 'تاريخ النهاية', sortable: true,
      render: (s) => s.end_date ? formatDateTime(s.end_date) : '---',
    },
    {
      key: 'is_current', label: 'الترم الحالي',
      render: (s) => s.is_current
        ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> نعم</span>
        : <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="h-4 w-4" /> لا</span>,
    },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (s) => formatDateTime(s.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الترم الدراسي"
        description="إدارة الترم والسنوات الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة ترم
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن ترم..."
            id="academic-semesters-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الترم_الدراسي')}
            onExportPDF={() => exportToPDF('academic-semesters-table', 'الترم الدراسي')}
            actions={(semester) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(semester)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف ترم', message: 'هل أنت متأكد من حذف هذا الترم؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(semester.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد ترم دراسي بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingSemester ? 'تعديل الترم الدراسي' : 'إضافة ترم دراسي جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingSemester ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الترم</label>
            <Input
              value={formData.semester_name}
              onChange={(e) => setFormData({ ...formData, semester_name: e.target.value })}
              placeholder="مثال: الترم الأول 2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_current" className="text-sm font-medium">الترم الحالي</label>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
