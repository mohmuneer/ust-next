'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feePaymentsService } from '@/services/fee-payments.service'
import { studentFeesService } from '@/services/student-fees.service'
import { studentsService } from '@/services/students.service'
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
import type { FeePayment } from '@/types'

export default function FeePaymentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeePayment | null>(null)
  const [formData, setFormData] = useState({
    student_fee_id: 0,
    amount: 0,
    payment_date: '',
    payment_method: 'cash',
    transaction_id: '',
    receipt_number: '',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: () => feePaymentsService.getAll(),
  })

  const { data: studentFees } = useQuery({
    queryKey: ['student-fees'],
    queryFn: () => studentFeesService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => feePaymentsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => feePaymentsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => feePaymentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee-payments'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: FeePayment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_fee_id: item.student_fee_id,
        amount: item.amount,
        payment_date: item.payment_date ? item.payment_date.slice(0, 10) : '',
        payment_method: item.payment_method,
        transaction_id: item.transaction_id || '',
        receipt_number: item.receipt_number || '',
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ student_fee_id: 0, amount: 0, payment_date: '', payment_method: 'cash', transaction_id: '', receipt_number: '', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ student_fee_id: 0, amount: 0, payment_date: '', payment_method: 'cash', transaction_id: '', receipt_number: '', notes: '' })
  }

  const handleSubmit = () => {
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<FeePayment>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب' },
    { key: 'fee_amount', label: 'مبلغ الرسوم' },
    { key: 'amount', label: 'المبلغ المدفوع' },
    { key: 'payment_date', label: 'تاريخ الدفع', render: (e) => e.payment_date ? e.payment_date.slice(0, 10) : '---' },
    { key: 'payment_method', label: 'طريقة الدفع' },
    { key: 'transaction_id', label: 'رقم المعاملة' },
    { key: 'receipt_number', label: 'رقم الإيصال' },
    { key: 'notes', label: 'ملاحظات' },
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
        title="مدفوعات الرسوم"
        description="إدارة مدفوعات الرسوم الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء دفعة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن دفعة..."
            id="fee-payments-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'مدفوعات الرسوم')}
            onExportPDF={() => exportToPDF('fee-payments-table', 'مدفوعات الرسوم')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف دفعة', message: 'هل أنت متأكد من حذف هذه الدفعة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مدفوعات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل دفعة' : 'إنشاء دفعة جديدة'}
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
            <label className="block text-sm font-medium mb-1">رسم الطالب *</label>
            <SearchableSelect
              value={formData.student_fee_id}
              onChange={(v) => setFormData({ ...formData, student_fee_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر الرسم' },
                ...(studentFees || []).map((f: any) => ({ value: f.id, label: `${f.student_name || 'طالب'} - ${f.fee_name || ''}` })),
              ]}
              searchPlaceholder="بحث عن رسم..."
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
            <label className="block text-sm font-medium mb-1">تاريخ الدفع</label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
            <Select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'cash', label: 'نقدي' },
                { value: 'bank_transfer', label: 'تحويل بنكي' },
                { value: 'credit_card', label: 'بطاقة ائتمان' },
                { value: 'check', label: 'شيك' },
                { value: 'online', label: 'دفع إلكتروني' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم المعاملة</label>
            <Input
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              placeholder="أدخل رقم المعاملة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الإيصال</label>
            <Input
              value={formData.receipt_number}
              onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
              placeholder="أدخل رقم الإيصال"
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
