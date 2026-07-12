'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentEnrollmentsService } from '@/services/student-enrollments.service'
import { studentsService } from '@/services/students.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { studyLevelsService } from '@/services/study-levels.service'
import { studyGroupsService } from '@/services/study-groups.service'
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
import type { StudentEnrollment } from '@/types'

export default function StudentEnrollmentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StudentEnrollment | null>(null)
  const [formData, setFormData] = useState({
    student_id: 0,
    academic_semester_id: 0,
    enrollment_type: 'new',
    enrollment_date: '',
    study_level_id: 0,
    study_group_id: 0,
    total_hours: 0,
    max_hours: 0,
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['student-enrollments'],
    queryFn: () => studentEnrollmentsService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const { data: levels } = useQuery({
    queryKey: ['study-levels'],
    queryFn: () => studyLevelsService.getAll(),
  })

  const { data: groups } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => studyGroupsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => studentEnrollmentsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => studentEnrollmentsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentEnrollmentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-enrollments'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: StudentEnrollment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id,
        academic_semester_id: item.academic_semester_id,
        enrollment_type: item.enrollment_type,
        enrollment_date: item.enrollment_date ? item.enrollment_date.slice(0, 10) : '',
        study_level_id: item.study_level_id || 0,
        study_group_id: item.study_group_id || 0,
        total_hours: item.total_hours,
        max_hours: item.max_hours || 0,
        status: item.status,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ student_id: 0, academic_semester_id: 0, enrollment_type: 'new', enrollment_date: '', study_level_id: 0, study_group_id: 0, total_hours: 0, max_hours: 0, status: 'active', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ student_id: 0, academic_semester_id: 0, enrollment_type: 'new', enrollment_date: '', study_level_id: 0, study_group_id: 0, total_hours: 0, max_hours: 0, status: 'active', notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.student_id || !formData.academic_semester_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<StudentEnrollment>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم القيد' },
    { key: 'semester_name', label: 'الفصل الدراسي' },
    {
      key: 'enrollment_type', label: 'نوع التسجيل',
      render: (e) => {
        const map: Record<string, string> = { new: 'جديد', transfer: 'تحويل', re_enroll: 'إعادة قيد', upgrade: 'ترقية' }
        return map[e.enrollment_type] || e.enrollment_type
      },
    },
    { key: 'level_name', label: 'المستوى' },
    { key: 'group_name', label: 'المجموعة' },
    { key: 'total_hours', label: 'الساعات المسجلة' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, string> = { active: 'نشط', completed: 'مكتمل', withdrawn: 'منسحب', suspended: 'موقوف' }
        return map[e.status] || e.status
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
        title="تسجيل الطلاب"
        description="إدارة تسجيل الطلاب في الفصول الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة تسجيل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن تسجيل..."
            id="student-enrollments-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'تسجيل الطلاب')}
            onExportPDF={() => exportToPDF('student-enrollments-table', 'تسجيل الطلاب')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف تسجيل', message: 'هل أنت متأكد من حذف هذا التسجيل؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد تسجيلات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل التسجيل' : 'إضافة تسجيل جديد'}
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
            <label className="block text-sm font-medium mb-1">الفصل الدراسي *</label>
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
          <div>
            <label className="block text-sm font-medium mb-1">نوع التسجيل</label>
            <Select
              value={formData.enrollment_type}
              onChange={(e) => setFormData({ ...formData, enrollment_type: e.target.value })}
              options={[
                { value: 'new', label: 'جديد' },
                { value: 'transfer', label: 'تحويل' },
                { value: 're_enroll', label: 'إعادة قيد' },
                { value: 'upgrade', label: 'ترقية' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ التسجيل</label>
            <Input
              type="date"
              value={formData.enrollment_date}
              onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المستوى</label>
            <SearchableSelect
              value={formData.study_level_id}
              onChange={(v) => setFormData({ ...formData, study_level_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون مستوى' },
                ...(levels || []).map((s: any) => ({ value: s.id, label: s.level_name })),
              ]}
              searchPlaceholder="بحث عن مستوى..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المجموعة</label>
            <SearchableSelect
              value={formData.study_group_id}
              onChange={(v) => setFormData({ ...formData, study_group_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون مجموعة' },
                ...(groups || []).map((s: any) => ({ value: s.id, label: s.group_name })),
              ]}
              searchPlaceholder="بحث عن مجموعة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الساعات المسجلة</label>
            <Input
              type="number"
              value={formData.total_hours}
              onChange={(e) => setFormData({ ...formData, total_hours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحد الأقصى للساعات</label>
            <Input
              type="number"
              value={formData.max_hours}
              onChange={(e) => setFormData({ ...formData, max_hours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'withdrawn', label: 'منسحب' },
                { value: 'suspended', label: 'موقوف' },
              ]}
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
