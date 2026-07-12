'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicWarningsService } from '@/services/academic-warnings.service'
import { studentsService } from '@/services/students.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { employeesService } from '@/services/employees.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { AcademicWarning } from '@/types'

export default function AcademicWarningsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AcademicWarning | null>(null)
  const [formData, setFormData] = useState({
    student_id: 0,
    warning_type: 'academic',
    warning_level: 1,
    reason: '',
    gpa_at_warning: 0,
    semester_id: 0,
    issued_by: 0,
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['academic-warnings'],
    queryFn: () => academicWarningsService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => academicWarningsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-warnings'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => academicWarningsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-warnings'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => academicWarningsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-warnings'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: AcademicWarning) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id,
        warning_type: item.warning_type,
        warning_level: item.warning_level,
        reason: item.reason || '',
        gpa_at_warning: item.gpa_at_warning || 0,
        semester_id: item.semester_id || 0,
        issued_by: item.issued_by || 0,
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ student_id: 0, warning_type: 'academic', warning_level: 1, reason: '', gpa_at_warning: 0, semester_id: 0, issued_by: 0, status: 'active', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ student_id: 0, warning_type: 'academic', warning_level: 1, reason: '', gpa_at_warning: 0, semester_id: 0, issued_by: 0, status: 'active', notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.student_id || !formData.reason.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<AcademicWarning>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم القيد' },
    {
      key: 'warning_type', label: 'نوع الإنذار',
      render: (e) => {
        const map: Record<string, string> = { academic: 'أكاديمي', attendance: 'حضور', behavioral: 'سلوكي' }
        return map[e.warning_type] || e.warning_type
      },
    },
    { key: 'warning_level', label: 'مستوى الإنذار' },
    { key: 'gpa_at_warning', label: 'المعدل عند الإنذار' },
    { key: 'semester_name', label: 'الفصل الدراسي' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-yellow-600' },
          resolved: { label: 'تم الحل', class: 'text-green-600' },
          escalated: { label: 'مرفوع', class: 'text-red-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    { key: 'issued_by_name', label: 'المصدر' },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (e) => formatDateTime(e.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإنذارات الأكاديمية"
        description="إدارة الإنذارات الأكاديمية للطلاب"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة إنذار
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن إنذار..."
            id="academic-warnings-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الإنذارات الأكاديمية')}
            onExportPDF={() => exportToPDF('academic-warnings-table', 'الإنذارات الأكاديمية')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف إنذار', message: 'هل أنت متأكد من حذف هذا الإنذار؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد إنذارات أكاديمية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الإنذار الأكاديمي' : 'إضافة إنذار أكاديمي جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1">نوع الإنذار</label>
            <Select
              value={formData.warning_type}
              onChange={(e) => setFormData({ ...formData, warning_type: e.target.value })}
              options={[
                { value: 'academic', label: 'أكاديمي' },
                { value: 'attendance', label: 'حضور' },
                { value: 'behavioral', label: 'سلوكي' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">مستوى الإنذار</label>
            <Input
              type="number"
              min={1}
              max={3}
              value={formData.warning_level}
              onChange={(e) => setFormData({ ...formData, warning_level: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الفصل الدراسي</label>
            <SearchableSelect
              value={formData.semester_id}
              onChange={(v) => setFormData({ ...formData, semester_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الفصل' },
                ...(semesters || []).map((s: any) => ({ value: s.id, label: s.semester_name })),
              ]}
              searchPlaceholder="بحث عن فصل..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المصدر</label>
            <SearchableSelect
              value={formData.issued_by}
              onChange={(v) => setFormData({ ...formData, issued_by: Number(v) })}
              options={[
                { value: 0, label: 'اختر الموظف' },
                ...(employees || []).map((s: any) => ({ value: s.id, label: s.full_name })),
              ]}
              searchPlaceholder="بحث عن موظف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المعدل عند الإنذار</label>
            <Input
              type="number"
              step="0.01"
              value={formData.gpa_at_warning}
              onChange={(e) => setFormData({ ...formData, gpa_at_warning: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'resolved', label: 'تم الحل' },
                { value: 'escalated', label: 'مرفوع' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">السبب *</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="أدخل سبب الإنذار"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات إضافية"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
