'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guardiansService } from '@/services/guardians.service'
import { studentsService } from '@/services/students.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2, UserRound, Search } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Guardian, Student } from '@/types'

const RELATION_TYPES = [
  { value: 'أب', label: 'أب' },
  { value: 'أم', label: 'أم' },
  { value: 'وصي', label: 'وصي' },
  { value: 'جد', label: 'جد' },
  { value: 'أخ', label: 'أخ' },
  { value: 'أخت', label: 'أخت' },
  { value: 'عم', label: 'عم' },
  { value: 'خال', label: 'خال' },
  { value: 'آخر', label: 'آخر' },
]

export default function GuardiansPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    relation_type: 'أب',
    student_ids: [] as number[],
  })
  const [studentSearch, setStudentSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardiansService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => guardiansService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => guardiansService.update(editingGuardian!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => guardiansService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guardians'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (guardian?: Guardian) => {
    if (guardian) {
      setEditingGuardian(guardian)
      setFormData({
        full_name: guardian.full_name,
        phone: guardian.phone || '',
        email: guardian.email || '',
        address: guardian.address || '',
        relation_type: guardian.relation_type || 'أب',
        student_ids: (guardian.students || []).map((s) => s.id),
      })
    } else {
      setEditingGuardian(null)
      setFormData({ full_name: '', phone: '', email: '', address: '', relation_type: 'أب', student_ids: [] })
    }
    setStudentSearch('')
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingGuardian(null)
    setFormData({ full_name: '', phone: '', email: '', address: '', relation_type: 'أب', student_ids: [] })
    setStudentSearch('')
  }

  const toggleStudent = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      student_ids: prev.student_ids.includes(id)
        ? prev.student_ids.filter((sid) => sid !== id)
        : [...prev.student_ids, id],
    }))
  }

  const handleSubmit = () => {
    if (!formData.full_name.trim() || formData.student_ids.length === 0) return
    if (editingGuardian) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Guardian>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'relation_type', label: 'صلة القرابة' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'email', label: 'البريد' },
    { key: 'address', label: 'العنوان' },
    {
      key: 'students',
      label: 'الطلاب',
      render: (g) => (
        <div className="flex flex-col gap-0.5">
          {(g.students || []).length > 0 ? (
            (g.students || []).map((s) => (
              <span key={s.id} className="text-sm" dir="ltr">
                {s.student_name} ({s.student_number})
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (g) => formatDateTime(g.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="أولياء الأمور"
        description="إدارة بيانات أولياء الأمور وربطهم بالطلاب"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة ولي أمر
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن ولي أمر..."
            id="guardians-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'أولياء_الأمور')}
            onExportPDF={() => exportToPDF('guardians-table', 'أولياء الأمور')}
            actions={(guardian) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(guardian)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف ولي أمر', message: 'هل أنت متأكد من حذف ولي الأمر هذا؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(guardian.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد بيانات أولياء أمور بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingGuardian ? 'تعديل بيانات ولي الأمر' : 'إضافة ولي أمر جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingGuardian ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الطلاب *</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="بحث عن طالب..."
                className="w-full h-10 rounded-xl border border-input bg-background pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-input bg-background p-2 space-y-1">
              {(students || [])
                .filter((s) => !studentSearch || s.full_name.includes(studentSearch) || (s.student_number || '').includes(studentSearch))
                .map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-primary/5 has-[:checked]:bg-primary/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.student_ids.includes(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm">{s.full_name} ({s.student_number})</span>
                  </label>
                ))}
              {(students || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">لا يوجد طلاب</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="أدخل اسم ولي الأمر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">صلة القرابة</label>
            <Select
              value={formData.relation_type}
              onChange={(e) => setFormData({ ...formData, relation_type: e.target.value })}
              options={RELATION_TYPES.map((r) => ({ value: r.value, label: r.label }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل العنوان (اختياري)"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
