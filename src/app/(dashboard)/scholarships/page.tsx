'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scholarshipsService } from '@/services/scholarships.service'
import { collegesService } from '@/services/colleges.service'
import { programsService } from '@/services/programs.service'
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
import type { Scholarship } from '@/types'

export default function ScholarshipsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Scholarship | null>(null)
  const [formData, setFormData] = useState({
    scholarship_name: '',
    scholarship_type: '',
    discount_percentage: 0,
    discount_amount: 0,
    college_id: 0,
    program_id: 0,
    max_students: 0,
    start_date: '',
    end_date: '',
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => scholarshipsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: () => programsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => scholarshipsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => scholarshipsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => scholarshipsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scholarships'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: Scholarship) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        scholarship_name: item.scholarship_name,
        scholarship_type: item.scholarship_type || '',
        discount_percentage: item.discount_percentage,
        discount_amount: item.discount_amount,
        college_id: item.college_id || 0,
        program_id: item.program_id || 0,
        max_students: item.max_students || 0,
        start_date: item.start_date ? item.start_date.slice(0, 10) : '',
        end_date: item.end_date ? item.end_date.slice(0, 10) : '',
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ scholarship_name: '', scholarship_type: '', discount_percentage: 0, discount_amount: 0, college_id: 0, program_id: 0, max_students: 0, start_date: '', end_date: '', status: 'active', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ scholarship_name: '', scholarship_type: '', discount_percentage: 0, discount_amount: 0, college_id: 0, program_id: 0, max_students: 0, start_date: '', end_date: '', status: 'active', notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.scholarship_name.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Scholarship>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'scholarship_name', label: 'اسم المنحة', sortable: true },
    { key: 'scholarship_type', label: 'نوع المنحة' },
    { key: 'discount_percentage', label: 'نسبة الخصم (%)' },
    { key: 'discount_amount', label: 'قيمة الخصم' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'program_name', label: 'البرنامج' },
    { key: 'max_students', label: 'الحد الأقصى للطلاب' },
    { key: 'start_date', label: 'تاريخ البداية', render: (e) => e.start_date ? e.start_date.slice(0, 10) : '---' },
    { key: 'end_date', label: 'تاريخ النهاية', render: (e) => e.end_date ? e.end_date.slice(0, 10) : '---' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-green-600' },
          inactive: { label: 'غير نشط', class: 'text-red-600' },
          expired: { label: 'منتهي', class: 'text-gray-600' },
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
        title="المنح الدراسية"
        description="إدارة المنح الدراسية والخصومات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء منحة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن منحة..."
            id="scholarships-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المنح الدراسية')}
            onExportPDF={() => exportToPDF('scholarships-table', 'المنح الدراسية')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف منحة', message: 'هل أنت متأكد من حذف هذه المنحة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد منح دراسية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل المنحة' : 'إنشاء منحة جديدة'}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">اسم المنحة *</label>
            <Input
              value={formData.scholarship_name}
              onChange={(e) => setFormData({ ...formData, scholarship_name: e.target.value })}
              placeholder="أدخل اسم المنحة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المنحة</label>
            <Select
              value={formData.scholarship_type}
              onChange={(e) => setFormData({ ...formData, scholarship_type: e.target.value })}
              options={[
                { value: '', label: 'اختر النوع' },
                { value: 'academic', label: 'أكاديمية' },
                { value: 'financial', label: 'مالية' },
                { value: 'sports', label: 'رياضية' },
                { value: 'cultural', label: 'ثقافية' },
                { value: 'other', label: 'أخرى' },
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
                { value: 'expired', label: 'منتهي' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نسبة الخصم (%)</label>
            <Input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">قيمة الخصم</label>
            <Input
              type="number"
              value={formData.discount_amount}
              onChange={(e) => setFormData({ ...formData, discount_amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحد الأقصى للطلاب</label>
            <Input
              type="number"
              value={formData.max_students}
              onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <SearchableSelect
              value={formData.college_id}
              onChange={(v) => setFormData({ ...formData, college_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع الكليات' },
                ...(colleges || []).map((c: any) => ({ value: c.id, label: c.college_name })),
              ]}
              searchPlaceholder="بحث عن كلية..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البرنامج</label>
            <SearchableSelect
              value={formData.program_id}
              onChange={(v) => setFormData({ ...formData, program_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع البرامج' },
                ...(programs || []).map((p: any) => ({ value: p.id, label: p.program_name })),
              ]}
              searchPlaceholder="بحث عن برنامج..."
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
