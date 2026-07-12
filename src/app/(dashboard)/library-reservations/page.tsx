'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryReservationsService } from '@/services/library-reservations.service'
import { libraryBooksService } from '@/services/library-books.service'
import { studentsService } from '@/services/students.service'
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
import type { LibraryReservation } from '@/types'

export default function LibraryReservationsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryReservation | null>(null)
  const [formData, setFormData] = useState({
    book_id: 0,
    student_id: 0,
    employee_id: 0,
    reserved_by_type: 'student',
    reservation_date: '',
    expiry_date: '',
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['library-reservations'],
    queryFn: () => libraryReservationsService.getAll(),
  })

  const { data: books } = useQuery({
    queryKey: ['library-books'],
    queryFn: () => libraryBooksService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => libraryReservationsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-reservations'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => libraryReservationsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-reservations'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryReservationsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-reservations'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: LibraryReservation) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        book_id: item.book_id,
        student_id: item.student_id || 0,
        employee_id: item.employee_id || 0,
        reserved_by_type: item.reserved_by_type,
        reservation_date: item.reservation_date.slice(0, 10),
        expiry_date: item.expiry_date ? item.expiry_date.slice(0, 10) : '',
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        book_id: 0, student_id: 0, employee_id: 0, reserved_by_type: 'student',
        reservation_date: '', expiry_date: '', status: 'active', notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      book_id: 0, student_id: 0, employee_id: 0, reserved_by_type: 'student',
      reservation_date: '', expiry_date: '', status: 'active', notes: '',
    })
  }

  const handleSubmit = () => {
    if (!formData.book_id || !formData.reservation_date) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<LibraryReservation>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'book_title', label: 'الكتاب', sortable: true },
    { key: 'reserved_by_name', label: 'الحاجز' },
    {
      key: 'reserved_by_type', label: 'النوع',
      render: (e) => e.reserved_by_type === 'student' ? 'طالب' : 'موظف',
    },
    {
      key: 'reservation_date', label: 'تاريخ الحجز',
      render: (e) => e.reservation_date.slice(0, 10),
    },
    {
      key: 'expiry_date', label: 'تاريخ الانتهاء',
      render: (e) => e.expiry_date ? e.expiry_date.slice(0, 10) : '---',
    },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-blue-600' },
          fulfilled: { label: 'مكتمل', class: 'text-green-600' },
          cancelled: { label: 'ملغي', class: 'text-red-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
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
        title="حجوزات المكتبة"
        description="إدارة حجوزات المكتبة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة حجز
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن حجز..."
            id="library-reservations-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'حجوزات المكتبة')}
            onExportPDF={() => exportToPDF('library-reservations-table', 'حجوزات المكتبة')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف حجز', message: 'هل أنت متأكد من حذف هذا الحجز؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد حجوزات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الحجز' : 'إضافة حجز جديد'}
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
            <label className="block text-sm font-medium mb-1">الكتاب *</label>
            <SearchableSelect
              value={formData.book_id}
              onChange={(v) => setFormData({ ...formData, book_id: Number(v) })}
              options={[
                ...(books || []).map((b: any) => ({
                  value: b.id,
                  label: `${b.title} (${b.available_copies}/${b.total_copies})`,
                })),
              ]}
              searchPlaceholder="بحث عن كتاب..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الحاجز</label>
            <Select
              value={formData.reserved_by_type}
              onChange={(e) => setFormData({ ...formData, reserved_by_type: e.target.value })}
              options={[
                { value: 'student', label: 'طالب' },
                { value: 'employee', label: 'موظف' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'fulfilled', label: 'مكتمل' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
            />
          </div>
          {formData.reserved_by_type === 'student' ? (
            <div>
              <label className="block text-sm font-medium mb-1">الطالب</label>
              <SearchableSelect
                value={formData.student_id}
                onChange={(v) => setFormData({ ...formData, student_id: Number(v) })}
                options={[
                  { value: 0, label: 'اختر طالباً' },
                  ...(students || []).map((s: any) => ({ value: s.id, label: s.full_name })),
                ]}
                searchPlaceholder="بحث عن طالب..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">الموظف</label>
              <SearchableSelect
                value={formData.employee_id}
                onChange={(v) => setFormData({ ...formData, employee_id: Number(v) })}
                options={[
                  { value: 0, label: 'اختر موظفاً' },
                  ...(employees || []).map((s: any) => ({ value: s.id, label: s.full_name })),
                ]}
                searchPlaceholder="بحث عن موظف..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الحجز *</label>
            <Input
              type="date"
              value={formData.reservation_date}
              onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
            <Input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>
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
