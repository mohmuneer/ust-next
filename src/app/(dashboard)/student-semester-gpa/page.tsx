'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSemesterGpaService } from '@/services/student-semester-gpa.service'
import { studentsService } from '@/services/students.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { StudentSemesterGpa } from '@/types'

export default function StudentSemesterGpaPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    student_id: 0,
    academic_semester_id: 0,
  })

  const { data } = useQuery({
    queryKey: ['student-semester-gpa'],
    queryFn: () => studentSemesterGpaService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const calculateMutation = useMutation({
    mutationFn: () => studentSemesterGpaService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-semester-gpa'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentSemesterGpaService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-semester-gpa'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = () => {
    setFormData({ student_id: 0, academic_semester_id: 0 })
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setFormData({ student_id: 0, academic_semester_id: 0 })
  }

  const handleSubmit = () => {
    if (!formData.student_id || !formData.academic_semester_id) return
    calculateMutation.mutate()
  }

  const columns: Column<StudentSemesterGpa>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم القيد' },
    { key: 'semester_name', label: 'الفصل الدراسي' },
    { key: 'semester_hours', label: 'ساعات الفصل' },
    { key: 'semester_gpa', label: 'معدل الفصل' },
    { key: 'semester_points', label: 'نقاط الفصل' },
    { key: 'cumulative_hours', label: 'الساعات التراكمية' },
    { key: 'cumulative_gpa', label: 'المعدل التراكمي' },
    { key: 'cumulative_points', label: 'النقاط التراكمية' },
    {
      key: 'calculated_at', label: 'تاريخ الاحتساب',
      render: (e) => formatDateTime(e.calculated_at),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="المعدل التراكمي للطلاب"
        description="إدارة وحساب المعدل التراكمي للطلاب"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Calculator className="h-4 w-4 ml-1" /> احتساب المعدل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن معدل..."
            id="student-semester-gpa-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المعدل التراكمي')}
            onExportPDF={() => exportToPDF('student-semester-gpa-table', 'المعدل التراكمي للطلاب')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف سجل المعدل', message: 'هل أنت متأكد من حذف سجل المعدل هذا؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد سجلات معدل بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="احتساب المعدل التراكمي"
        size="default"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={calculateMutation.isPending}>
              احتساب
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">الطالب *</label>
            <SearchableSelect
              value={formData.student_id}
              onChange={(v) => setFormData({ ...formData, student_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الطالب' },
                ...(students || []).map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.student_number})` })),
              ]}
              searchPlaceholder="بحث عن طالب..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الفصل الدراسي *</label>
            <SearchableSelect
              value={formData.academic_semester_id}
              onChange={(v) => setFormData({ ...formData, academic_semester_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الفصل' },
                ...(semesters || []).map((s: any) => ({ value: s.id, label: s.semester_name })),
              ]}
              searchPlaceholder="بحث عن فصل..."
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
