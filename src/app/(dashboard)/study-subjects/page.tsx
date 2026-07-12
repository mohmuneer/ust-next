'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studySubjectsService } from '@/services/study-subjects.service'
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
import { Plus, Pencil, Trash2, BookCopy } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { StudySubject, College, Department, StudyLevel, StudyGroup, AcademicSemester } from '@/types'

export default function StudySubjectsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<StudySubject | null>(null)
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_code: '',
    college_id: 0,
    department_id: 0,
    study_level_id: 0,
    study_group_id: 0,
    academic_semester_id: 0,
  })

  const { data } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: departments } = useQuery({
    queryKey: ['departments-all'],
    queryFn: () => departmentsService.getAll(),
  })

  const { data: studyLevels } = useQuery({
    queryKey: ['study-levels'],
    queryFn: async () => {
      const res = await fetch('/api/study-levels')
      return res.json() as Promise<StudyLevel[]>
    },
  })

  const { data: studyGroups } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => studySubjectsService.getAll().then(() =>
      fetch('/api/study-groups').then(r => r.json()) as Promise<StudyGroup[]>
    ),
  })

  const { data: academicSemesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: async () => {
      const res = await fetch('/api/academic-semesters')
      return res.json() as Promise<AcademicSemester[]>
    },
  })

  const createMutation = useMutation({
    mutationFn: () => studySubjectsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => studySubjectsService.update(editingSubject!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studySubjectsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-subjects'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (subject?: StudySubject) => {
    if (subject) {
      setEditingSubject(subject)
      setFormData({
        subject_name: subject.subject_name,
        subject_code: subject.subject_code || '',
        college_id: subject.college_id || 0,
        department_id: subject.department_id || 0,
        study_level_id: subject.study_level_id || 0,
        study_group_id: subject.study_group_id || 0,
        academic_semester_id: subject.academic_semester_id || 0,
      })
    } else {
      setEditingSubject(null)
      setFormData({ subject_name: '', subject_code: '', college_id: 0, department_id: 0, study_level_id: 0, study_group_id: 0, academic_semester_id: 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingSubject(null)
    setFormData({ subject_name: '', subject_code: '', college_id: 0, department_id: 0, study_level_id: 0, study_group_id: 0, academic_semester_id: 0 })
  }

  const handleSubmit = () => {
    if (!formData.subject_name.trim()) return
    if (editingSubject) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const filteredDepartments = (departments || []).filter(
    (d: Department) => !formData.college_id || d.college_id === formData.college_id
  )

  const filteredGroups = (studyGroups || []).filter(
    (g: StudyGroup) => !formData.college_id || g.college_id === formData.college_id
  )

  const columns: Column<StudySubject>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'subject_name', label: 'اسم المادة', sortable: true },
    { key: 'subject_code', label: 'الرمز', sortable: true },
    { key: 'college_name', label: 'الكلية', render: (s) => s.college_name || 'الكل' },
    { key: 'department_name', label: 'القسم', render: (s) => s.department_name || 'الكل' },
    { key: 'level_name', label: 'المستوى', render: (s) => s.level_name || 'الكل' },
    { key: 'group_name', label: 'المجموعة', render: (s) => s.group_name || 'الكل' },
    { key: 'semester_name', label: 'الترم', render: (s) => s.semester_name || 'الكل' },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (s) => formatDateTime(s.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواد الدراسية"
        description="إدارة المواد الدراسية المسجلة في النظام"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مادة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مادة..."
            id="study-subjects-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المواد_الدراسية')}
            onExportPDF={() => exportToPDF('study-subjects-table', 'المواد الدراسية')}
            actions={(subject) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(subject)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مادة', message: 'هل أنت متأكد من حذف هذه المادة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(subject.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مواد دراسية بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingSubject ? 'تعديل المادة الدراسية' : 'إضافة مادة دراسية جديدة'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingSubject ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المادة</label>
            <Input
              value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
              placeholder="أدخل اسم المادة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز المادة (اختياري)</label>
            <Input
              value={formData.subject_code}
              onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
              placeholder="مثال: MATH101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <SearchableSelect
              value={formData.college_id}
              onChange={(v) => setFormData({ ...formData, college_id: Number(v), department_id: 0, study_group_id: 0 })}
              options={[
                { value: 0, label: 'جميع الكليات' },
                ...(colleges || []).map((c: College) => ({ value: c.id, label: c.college_name })),
              ]}
              searchPlaceholder="بحث عن كلية..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم الدراسي</label>
            <SearchableSelect
              value={formData.department_id}
              onChange={(v) => setFormData({ ...formData, department_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع الأقسام' },
                ...filteredDepartments.map((d: Department) => ({ value: d.id, label: d.department_name })),
              ]}
              searchPlaceholder="بحث عن قسم..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المستوى الدراسي</label>
            <SearchableSelect
              value={formData.study_level_id}
              onChange={(v) => setFormData({ ...formData, study_level_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع المستويات' },
                ...(studyLevels || []).map((s: StudyLevel) => ({ value: s.id, label: s.level_name })),
              ]}
              searchPlaceholder="بحث عن مستوى..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المجموعة الدراسية</label>
            <SearchableSelect
              value={formData.study_group_id}
              onChange={(v) => setFormData({ ...formData, study_group_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع المجموعات' },
                ...filteredGroups.map((g: StudyGroup) => ({ value: g.id, label: `${g.group_name} (${g.group_type})` })),
              ]}
              searchPlaceholder="بحث عن مجموعة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الترم الدراسي</label>
            <SearchableSelect
              value={formData.academic_semester_id}
              onChange={(v) => setFormData({ ...formData, academic_semester_id: Number(v) })}
              options={[
                { value: 0, label: 'جميع الترمات' },
                ...(academicSemesters || []).map((s: AcademicSemester) => ({ value: s.id, label: s.semester_name })),
              ]}
              searchPlaceholder="بحث عن ترم..."
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
