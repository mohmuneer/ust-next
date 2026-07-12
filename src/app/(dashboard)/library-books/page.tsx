'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryBooksService } from '@/services/library-books.service'
import { collegesService } from '@/services/colleges.service'
import { departmentsService } from '@/services/departments.service'
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
import type { LibraryBook } from '@/types'

export default function LibraryBooksPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryBook | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    author: '',
    publisher: '',
    isbn: '',
    edition: '',
    publication_year: '',
    category: '',
    book_type: 'printed',
    total_copies: 1,
    available_copies: 1,
    shelf_location: '',
    college_id: 0,
    department_id: 0,
    description: '',
    status: 'active',
  })

  const { data } = useQuery({
    queryKey: ['library-books'],
    queryFn: () => libraryBooksService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => libraryBooksService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => libraryBooksService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => libraryBooksService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library-books'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: LibraryBook) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        title_en: item.title_en || '',
        author: item.author || '',
        publisher: item.publisher || '',
        isbn: item.isbn || '',
        edition: item.edition || '',
        publication_year: item.publication_year ? String(item.publication_year) : '',
        category: item.category || '',
        book_type: item.book_type,
        total_copies: item.total_copies,
        available_copies: item.available_copies,
        shelf_location: item.shelf_location || '',
        college_id: item.college_id || 0,
        department_id: item.department_id || 0,
        description: item.description || '',
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({
        title: '', title_en: '', author: '', publisher: '', isbn: '', edition: '',
        publication_year: '', category: '', book_type: 'printed', total_copies: 1,
        available_copies: 1, shelf_location: '', college_id: 0, department_id: 0,
        description: '', status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      title: '', title_en: '', author: '', publisher: '', isbn: '', edition: '',
      publication_year: '', category: '', book_type: 'printed', total_copies: 1,
      available_copies: 1, shelf_location: '', college_id: 0, department_id: 0,
      description: '', status: 'active',
    })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<LibraryBook>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'author', label: 'المؤلف' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'book_type', label: 'النوع', render: (e) => e.book_type === 'printed' ? 'مطبوع' : 'إلكتروني' },
    { key: 'total_copies', label: 'إجمالي النسخ' },
    { key: 'available_copies', label: 'النسخ المتاحة' },
    { key: 'category', label: 'التصنيف' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-green-600' },
          inactive: { label: 'غير نشط', class: 'text-red-600' },
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
        title="كتب المكتبة"
        description="إدارة كتب المكتبة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة كتاب
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن كتاب..."
            id="library-books-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'كتب المكتبة')}
            onExportPDF={() => exportToPDF('library-books-table', 'كتب المكتبة')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف كتاب', message: 'هل أنت متأكد من حذف هذا الكتاب؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد كتب بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}
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
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان الكتاب"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">العنوان (إنجليزي)</label>
            <Input
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="أدخل عنوان الكتاب بالإنجليزية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المؤلف</label>
            <Input
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="أدخل اسم المؤلف"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الناشر</label>
            <Input
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              placeholder="أدخل اسم الناشر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <Input
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="رقم ISBN"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الطبعة</label>
            <Input
              value={formData.edition}
              onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
              placeholder="رقم الطبعة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">سنة النشر</label>
            <Input
              type="number"
              value={formData.publication_year}
              onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التصنيف</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="تصنيف الكتاب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع الكتاب</label>
            <Select
              value={formData.book_type}
              onChange={(e) => setFormData({ ...formData, book_type: e.target.value })}
              options={[
                { value: 'printed', label: 'مطبوع' },
                { value: 'electronic', label: 'إلكتروني' },
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
                { value: 'inactive', label: 'غير نشط' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">إجمالي النسخ</label>
            <Input
              type="number"
              min={0}
              value={formData.total_copies}
              onChange={(e) => setFormData({ ...formData, total_copies: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">النسخ المتاحة</label>
            <Input
              type="number"
              min={0}
              value={formData.available_copies}
              onChange={(e) => setFormData({ ...formData, available_copies: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">موقع الرف</label>
            <Input
              value={formData.shelf_location}
              onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
              placeholder="موقع الكتاب على الرف"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <SearchableSelect
              value={formData.college_id}
              onChange={(v) => setFormData({ ...formData, college_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع الكليات' },
                ...(colleges || []).map((s: any) => ({ value: s.id, label: s.college_name })),
              ]}
              searchPlaceholder="بحث عن كلية..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم</label>
            <SearchableSelect
              value={formData.department_id}
              onChange={(v) => setFormData({ ...formData, department_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع الأقسام' },
                ...(departments || []).map((s: any) => ({ value: s.id, label: s.department_name })),
              ]}
              searchPlaceholder="بحث عن قسم..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف الكتاب"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
