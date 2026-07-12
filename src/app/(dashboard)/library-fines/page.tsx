'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryFinesService } from '@/services/library-fines.service'
import { libraryBorrowingsService } from '@/services/library-borrowings.service'
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
import type { LibraryFine } from '@/types'

export default function LibraryFinesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryFine | null>(null)
  const [formData, setFormData] = useState({
    borrowing_id: 0,
    fine_type: 'late_return',
    amount: 0,
    days_overdue: 0,
    is_paid: false,
    payment_date: '',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['library-fines'],
    queryFn: () => libraryFinesService.getAll(),
  })

  const { data: borrowings } = useQuery({
    queryKey: ['library-borrowings'],
    queryFn: () => libraryBorrowingsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => libraryFinesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => libraryFinesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryFinesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-fines'] }),
  })

  const togglePaidMutation = useMutation({
    mutationFn: (item: LibraryFine) => libraryFinesService.update(item.id, { is_paid: !item.is_paid, payment_date: !item.is_paid ? new Date().toISOString().slice(0, 10) : null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-fines'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: LibraryFine) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        borrowing_id: item.borrowing_id,
        fine_type: item.fine_type,
        amount: item.amount,
        days_overdue: item.days_overdue,
        is_paid: item.is_paid,
        payment_date: item.payment_date ? item.payment_date.slice(0, 10) : '',
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        borrowing_id: 0, fine_type: 'late_return', amount: 0, days_overdue: 0,
        is_paid: false, payment_date: '', notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      borrowing_id: 0, fine_type: 'late_return', amount: 0, days_overdue: 0,
      is_paid: false, payment_date: '', notes: '',
    })
  }

  const handleSubmit = () => {
    if (!formData.borrowing_id || !formData.amount) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<LibraryFine>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'book_title', label: 'الكتاب' },
    { key: 'student_name', label: 'الطالب' },
    {
      key: 'fine_type', label: 'نوع الغرامة',
      render: (e) => {
        const map: Record<string, string> = {
          late_return: 'تأخير إرجاع',
          damage: 'تلف الكتاب',
          loss: 'فقدان الكتاب',
        }
        return map[e.fine_type] || e.fine_type
      },
    },
    { key: 'amount', label: 'المبلغ' },
    { key: 'days_overdue', label: 'أيام التأخير' },
    {
      key: 'is_paid', label: 'تم الدفع',
      render: (e) => (
        <span className={e.is_paid ? 'text-green-600' : 'text-red-600'}>
          {e.is_paid ? 'مدفوع' : 'غير مدفوع'}
        </span>
      ),
    },
    {
      key: 'payment_date', label: 'تاريخ الدفع',
      render: (e) => e.payment_date ? e.payment_date.slice(0, 10) : '---',
    },
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
        title="غرامات المكتبة"
        description="إدارة غرامات المكتبة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة غرامة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن غرامة..."
            id="library-fines-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'غرامات المكتبة')}
            onExportPDF={() => exportToPDF('library-fines-table', 'غرامات المكتبة')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button
                  variant={item.is_paid ? 'outline' : 'primary'}
                  size="sm"
                  onClick={async () => {
                    const action = item.is_paid ? 'إلغاء دفع' : 'تحديد كمدفوع'
                    const ok = await confirm({ title: action + ' الغرامة', message: `هل أنت متأكد من ${action} هذه الغرامة؟`, confirmText: action, cancelText: 'إلغاء', icon: 'warning' })
                    if (ok) togglePaidMutation.mutate(item)
                  }}
                >
                  {item.is_paid ? 'إلغاء الدفع' : 'تحديد كمدفوع'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف غرامة', message: 'هل أنت متأكد من حذف هذه الغرامة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد غرامات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الغرامة' : 'إضافة غرامة جديدة'}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الاستعارة *</label>
            <SearchableSelect
              value={formData.borrowing_id}
              onChange={(v) => setFormData({ ...formData, borrowing_id: Number(v) })}
              options={[
                ...(borrowings || []).map((b: any) => ({
                  value: b.id,
                  label: `${b.book_title || 'كتاب'} - ${b.borrowed_by_name || ''}`,
                })),
              ]}
              searchPlaceholder="بحث عن استعارة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الغرامة</label>
            <Select
              value={formData.fine_type}
              onChange={(e) => setFormData({ ...formData, fine_type: e.target.value })}
              options={[
                { value: 'late_return', label: 'تأخير إرجاع' },
                { value: 'damage', label: 'تلف الكتاب' },
                { value: 'loss', label: 'فقدان الكتاب' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المبلغ *</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">أيام التأخير</label>
            <Input
              type="number"
              min={0}
              value={formData.days_overdue}
              onChange={(e) => setFormData({ ...formData, days_overdue: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تم الدفع</label>
            <Select
              value={formData.is_paid ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_paid: e.target.value === 'true', payment_date: e.target.value === 'true' ? new Date().toISOString().slice(0, 10) : '' })}
              options={[
                { value: 'false', label: 'غير مدفوع' },
                { value: 'true', label: 'مدفوع' },
              ]}
            />
          </div>
          {formData.is_paid && (
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الدفع</label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
