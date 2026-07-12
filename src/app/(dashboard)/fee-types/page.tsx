'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeTypesService } from '@/services/fee-types.service'
import { collegesService } from '@/services/colleges.service'
import { programsService } from '@/services/programs.service'
import { studyLevelsService } from '@/services/study-levels.service'
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
import type { FeeType } from '@/types'

export default function FeeTypesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeeType | null>(null)
  const [formData, setFormData] = useState({
    fee_name: '',
    fee_name_en: '',
    fee_code: '',
    amount: 0,
    is_recurring: false,
    recurring_period: '',
    college_id: 0,
    program_id: 0,
    study_level_id: 0,
    notes: '',
    status: 'active',
  })

  const { data } = useQuery({
    queryKey: ['fee-types'],
    queryFn: () => feeTypesService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: () => programsService.getAll(),
  })

  const { data: levels } = useQuery({
    queryKey: ['study-levels'],
    queryFn: () => studyLevelsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => feeTypesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => feeTypesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => feeTypesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee-types'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: FeeType) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        fee_name: item.fee_name,
        fee_name_en: item.fee_name_en || '',
        fee_code: item.fee_code || '',
        amount: item.amount,
        is_recurring: item.is_recurring,
        recurring_period: item.recurring_period || '',
        college_id: item.college_id || 0,
        program_id: item.program_id || 0,
        study_level_id: item.study_level_id || 0,
        notes: item.notes || '',
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({ fee_name: '', fee_name_en: '', fee_code: '', amount: 0, is_recurring: false, recurring_period: '', college_id: 0, program_id: 0, study_level_id: 0, notes: '', status: 'active' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ fee_name: '', fee_name_en: '', fee_code: '', amount: 0, is_recurring: false, recurring_period: '', college_id: 0, program_id: 0, study_level_id: 0, notes: '', status: 'active' })
  }

  const handleSubmit = () => {
    if (!formData.fee_name.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<FeeType>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'fee_name', label: 'اسم الرسوم', sortable: true },
    { key: 'fee_code', label: 'الكود' },
    { key: 'amount', label: 'المبلغ' },
    {
      key: 'is_recurring', label: 'متكرر',
      render: (e) => e.is_recurring ? 'نعم' : 'لا',
    },
    { key: 'recurring_period', label: 'فترة التكرار' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'program_name', label: 'البرنامج' },
    { key: 'level_name', label: 'المستوى' },
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
        title="أنواع الرسوم"
        description="إدارة أنواع الرسوم الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إنشاء نوع رسوم
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن نوع رسوم..."
            id="fee-types-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'أنواع الرسوم')}
            onExportPDF={() => exportToPDF('fee-types-table', 'أنواع الرسوم')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف نوع رسوم', message: 'هل أنت متأكد من حذف هذا النوع؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد أنواع رسوم بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل نوع الرسوم' : 'إنشاء نوع رسوم جديد'}
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
            <label className="block text-sm font-medium mb-1">اسم الرسوم *</label>
            <Input
              value={formData.fee_name}
              onChange={(e) => setFormData({ ...formData, fee_name: e.target.value })}
              placeholder="أدخل اسم الرسوم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
            <Input
              value={formData.fee_name_en}
              onChange={(e) => setFormData({ ...formData, fee_name_en: e.target.value })}
              placeholder="Fee name in English"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كود الرسوم</label>
            <Input
              value={formData.fee_code}
              onChange={(e) => setFormData({ ...formData, fee_code: e.target.value })}
              placeholder="أدخل كود الرسوم"
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
            <label className="block text-sm font-medium mb-1">رسوم متكررة</label>
            <Select
              value={formData.is_recurring ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.value === 'true' })}
              options={[
                { value: 'false', label: 'لا' },
                { value: 'true', label: 'نعم' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">فترة التكرار</label>
            <Select
              value={formData.recurring_period}
              onChange={(e) => setFormData({ ...formData, recurring_period: e.target.value })}
              options={[
                { value: '', label: 'بدون' },
                { value: 'monthly', label: 'شهري' },
                { value: 'quarterly', label: 'ربع سنوي' },
                { value: 'semester', label: 'فصلي' },
                { value: 'yearly', label: 'سنوي' },
              ]}
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
          <div>
            <label className="block text-sm font-medium mb-1">المستوى</label>
            <SearchableSelect
              value={formData.study_level_id}
              onChange={(v) => setFormData({ ...formData, study_level_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع المستويات' },
                ...(levels || []).map((l: any) => ({ value: l.id, label: l.level_name })),
              ]}
              searchPlaceholder="بحث عن مستوى..."
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
