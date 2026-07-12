'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicRecordsService } from '@/services/academic-records.service'
import { studentsService } from '@/services/students.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
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
import type { AcademicRecord } from '@/types'

export default function AcademicRecordsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AcademicRecord | null>(null)
  const [formData, setFormData] = useState({
    student_id: 0,
    study_subject_id: 0,
    academic_semester_id: 0,
    study_group_id: 0,
    grade_numeric: 0,
    grade_letter: '',
    grade_points: 0,
    is_pass: true,
    status: 'active',
    attendance_percentage: 0,
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['academic-records'],
    queryFn: () => academicRecordsService.getAll(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const { data: groups } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => studyGroupsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => academicRecordsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-records'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => academicRecordsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-records'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => academicRecordsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academic-records'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: AcademicRecord) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        student_id: item.student_id,
        study_subject_id: item.study_subject_id,
        academic_semester_id: item.academic_semester_id || 0,
        study_group_id: item.study_group_id || 0,
        grade_numeric: item.grade_numeric || 0,
        grade_letter: item.grade_letter || '',
        grade_points: item.grade_points || 0,
        is_pass: item.is_pass ?? true,
        status: item.status,
        attendance_percentage: item.attendance_percentage || 0,
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ student_id: 0, study_subject_id: 0, academic_semester_id: 0, study_group_id: 0, grade_numeric: 0, grade_letter: '', grade_points: 0, is_pass: true, status: 'active', attendance_percentage: 0, notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ student_id: 0, study_subject_id: 0, academic_semester_id: 0, study_group_id: 0, grade_numeric: 0, grade_letter: '', grade_points: 0, is_pass: true, status: 'active', attendance_percentage: 0, notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.student_id || !formData.study_subject_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<AcademicRecord>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب', sortable: true },
    { key: 'student_number', label: 'رقم القيد' },
    { key: 'subject_name', label: 'المادة' },
    { key: 'semester_name', label: 'الفصل' },
    { key: 'grade_numeric', label: 'الدرجة' },
    { key: 'grade_letter', label: 'التقدير' },
    {
      key: 'is_pass', label: 'ناجح',
      render: (e) => e.is_pass ? <span className="text-green-600">نعم</span> : <span className="text-red-600">لا</span>,
    },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, string> = { active: 'نشط', completed: 'مكتمل', withdrawn: 'منسحب' }
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
        title="السجلات الأكاديمية"
        description="إدارة السجلات الأكاديمية للطلاب"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة سجل
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن سجل..."
            id="academic-records-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'السجلات الأكاديمية')}
            onExportPDF={() => exportToPDF('academic-records-table', 'السجلات الأكاديمية')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف سجل', message: 'هل أنت متأكد من حذف هذا السجل؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد سجلات أكاديمية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل السجل الأكاديمي' : 'إضافة سجل أكاديمي جديد'}
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
            <label className="block text-sm font-medium mb-1">المادة *</label>
            <SearchableSelect
              value={formData.study_subject_id}
              onChange={(v) => setFormData({ ...formData, study_subject_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر المادة' },
                ...(subjects || []).map((s: any) => ({ value: s.id, label: s.subject_name })),
              ]}
              searchPlaceholder="بحث عن مادة..."
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
            <label className="block text-sm font-medium mb-1">الدرجة</label>
            <Input
              type="number"
              value={formData.grade_numeric}
              onChange={(e) => setFormData({ ...formData, grade_numeric: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التقدير</label>
            <Input
              value={formData.grade_letter}
              onChange={(e) => setFormData({ ...formData, grade_letter: e.target.value })}
              placeholder="مثال: A, B+"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نقاط التقدير</label>
            <Input
              type="number"
              step="0.01"
              value={formData.grade_points}
              onChange={(e) => setFormData({ ...formData, grade_points: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نسبة الحضور</label>
            <Input
              type="number"
              value={formData.attendance_percentage}
              onChange={(e) => setFormData({ ...formData, attendance_percentage: Number(e.target.value) })}
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
              ]}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_pass}
                onChange={(e) => setFormData({ ...formData, is_pass: e.target.checked })}
              />
              <span className="text-sm font-medium">ناجح</span>
            </label>
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
