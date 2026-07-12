'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryBorrowingsService } from '@/services/library-borrowings.service'
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
import { Plus, Pencil, Trash2, Undo2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { LibraryBorrowing } from '@/types'

export default function LibraryBorrowingsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryBorrowing | null>(null)
  const [formData, setFormData] = useState({
    book_id: 0,
    student_id: 0,
    employee_id: 0,
    borrowed_by_type: 'student',
    borrow_date: '',
    due_date: '',
    return_date: '',
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['library-borrowings'],
    queryFn: () => libraryBorrowingsService.getAll(),
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
    mutationFn: () => libraryBorrowingsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-borrowings'] })
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => libraryBorrowingsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-borrowings'] })
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryBorrowingsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-borrowings'] }),
  })

  const returnMutation = useMutation({
    mutationFn: (id: number) => libraryBorrowingsService.update(id, { status: 'returned', return_date: new Date().toISOString().slice(0, 10) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-borrowings'] })
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
    },
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: LibraryBorrowing) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        book_id: item.book_id,
        student_id: item.student_id || 0,
        employee_id: item.employee_id || 0,
        borrowed_by_type: item.borrowed_by_type,
        borrow_date: item.borrow_date.slice(0, 10),
        due_date: item.due_date.slice(0, 10),
        return_date: item.return_date ? item.return_date.slice(0, 10) : '',
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        book_id: 0, student_id: 0, employee_id: 0, borrowed_by_type: 'student',
        borrow_date: '', due_date: '', return_date: '', status: 'active', notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      book_id: 0, student_id: 0, employee_id: 0, borrowed_by_type: 'student',
      borrow_date: '', due_date: '', return_date: '', status: 'active', notes: '',
    })
  }

  const handleSubmit = () => {
    if (!formData.book_id || !formData.borrow_date) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<LibraryBorrowing>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'book_title', label: 'الكتاب', sortable: true },
    { key: 'borrowed_by_name', label: 'المستعير' },
    { key: 'borrowed_by_type', label: 'النوع', render: (e) => e.borrowed_by_type === 'student' ? 'طالب' : 'موظف' },
    { key: 'borrow_date', label: 'تاريخ الاستعارة', render: (e) => e.borrow_date.slice(0, 10) },
    { key: 'due_date', label: 'تاريخ الإرجاع', render: (e) => e.due_date.slice(0, 10) },
    {
      key: 'return_date', label: 'تاريخ الإعادة',
      render: (e) => e.return_date ? e.return_date.slice(0, 10) : '---',
    },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-blue-600' },
          returned: { label: 'تم الإرجاع', class: 'text-green-600' },
          lost: { label: 'مفقود', class: 'text-red-600' },
          overdue: { label: 'متأخر', class: 'text-yellow-600' },
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

  const availableBooks = (books || []).filter((b: any) => b.available_copies > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="استعارات المكتبة"
        description="إدارة استعارات المكتبة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة استعارة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن استعارة..."
            id="library-borrowings-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'استعارات المكتبة')}
            onExportPDF={() => exportToPDF('library-borrowings-table', 'استعارات المكتبة')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                {item.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({ title: 'إرجاع الكتاب', message: 'هل أنت متأكد من إرجاع هذا الكتاب؟', confirmText: 'إرجاع', cancelText: 'إلغاء', variant: 'danger', icon: 'warning' })
                      if (ok) returnMutation.mutate(item.id)
                    }}
                  >
                    <Undo2 className="h-4 w-4 ml-1" /> إرجاع
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف استعارة', message: 'هل أنت متأكد من حذف هذه الاستعارة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد استعارات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الاستعارة' : 'إضافة استعارة جديدة'}
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
                ...(editingItem ? books || [] : availableBooks).map((b: any) => ({
                  value: b.id,
                  label: `${b.title} (${b.available_copies}/${b.total_copies})`,
                })),
              ]}
              searchPlaceholder="بحث عن كتاب..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المستعير</label>
            <Select
              value={formData.borrowed_by_type}
              onChange={(e) => setFormData({ ...formData, borrowed_by_type: e.target.value })}
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
                { value: 'returned', label: 'تم الإرجاع' },
                { value: 'lost', label: 'مفقود' },
                { value: 'overdue', label: 'متأخر' },
              ]}
            />
          </div>
          {formData.borrowed_by_type === 'student' ? (
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
            <label className="block text-sm font-medium mb-1">تاريخ الاستعارة *</label>
            <Input
              type="date"
              value={formData.borrow_date}
              onChange={(e) => setFormData({ ...formData, borrow_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الإرجاع المتوقع</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الإعادة الفعلي</label>
            <Input
              type="date"
              value={formData.return_date}
              onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
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
