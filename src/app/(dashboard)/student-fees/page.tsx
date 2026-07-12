'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentFeesService } from '@/services/student-fees.service'
import { studentsService } from '@/services/students.service'
import { feeTypesService } from '@/services/fee-types.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
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
import type { StudentFee } from '@/types'

export default function StudentFeesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StudentFee | null>(null)
  const [formData, setFormData] = useState({
    student_id: 0,
    fee_type_id: 0,
    amount: 0,
    discount: 0,
    discount_reason: '',
    due_date: '',
    status: 'pending',
    academic_semester_id: 0,
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['student-fees'],
    queryFn: () => studentFeesService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: feeTypes } = useQuery({
    queryKey: ['fee-types'],
    queryFn: () => feeTypesService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => studentFeesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => studentFeesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fees'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentFeesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-fees'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: StudentFee) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id,
        fee_type_id: item.fee_type_id,
        amount: item.amount,
        discount: item.discount,
        discount_reason: item.discount_reason || '',
        due_date: item.due_date ? item.due_date.slice(0, 10) : '',
        status: item.status,
        academic_semester_id: item.academic_semester_id || 0,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ student_id: 0, fee_type_id: 0, amount: 0, discount: 0, discount_reason: '', due_date: '', status: 'pending', academic_semester_id: 0, notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ student_id: 0, fee_type_id: 0, amount: 0, discount: 0, discount_reason: '', due_date: '', status: 'pending', academic_semester_id: 0, notes: '' })
  }

  const handleSubmit = () => {
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<StudentFee>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب' },
    { key: 'student_number', label: 'رقم الطالب' },
    { key: 'fee_name', label: 'نوع الرسوم' },
    { key: 'amount', label: 'المبلغ' },
    { key: 'discount', label: 'الخصم' },
    { key: 'paid_amount', label: 'المدفوع' },
    { key: 'remaining_amount', label: 'المتبقي' },
    { key: 'due_date', label: 'تاريخ الاستحقاق', render: (e) => e.due_date ? e.due_date.slice(0, 10) : '---' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          pending: { label: 'معلق', class: 'text-yellow-600' },
          paid: { label: 'مدفوع', class: 'text-green-600' },
          partially_paid: { label: 'مدفوع جزئياً', class: 'text-blue-600' },
          overdue: { label: 'متأخر', class: 'text-red-600' },
          cancelled: { label: 'ملغى', class: 'text-gray-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    { key: 'semester_name', label: 'الفصل الدراسي' },
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
        title="رسوم الطلاب"
        description="إدارة رسوم الطلاب الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء رسم
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن رسم طالب..."
            id="student-fees-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'رسوم الطلاب')}
            onExportPDF={() => exportToPDF('student-fees-table', 'رسوم الطلاب')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف رسم', message: 'هل أنت متأكد من حذف هذا الرسم؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد رسوم طلاب بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل رسم الطالب' : 'إنشاء رسم طالب جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إنشاء'}
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
            <label className="block text-sm font-medium mb-1">نوع الرسوم *</label>
            <SearchableSelect
              value={formData.fee_type_id}
              onChange={(v) => setFormData({ ...formData, fee_type_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر نوع الرسوم' },
                ...(feeTypes || []).map((f: any) => ({ value: f.id, label: f.fee_name })),
              ]}
              searchPlaceholder="بحث عن نوع رسوم..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الخصم</label>
            <Input
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">سبب الخصم</label>
            <Input
              value={formData.discount_reason}
              onChange={(e) => setFormData({ ...formData, discount_reason: e.target.value })}
              placeholder="أدخل سبب الخصم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'pending', label: 'معلق' },
                { value: 'paid', label: 'مدفوع' },
                { value: 'partially_paid', label: 'مدفوع جزئياً' },
                { value: 'overdue', label: 'متأخر' },
                { value: 'cancelled', label: 'ملغى' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الفصل الدراسي</label>
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل الملاحظات"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
