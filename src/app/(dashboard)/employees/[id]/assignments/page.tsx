'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesService } from '@/services/employees.service'
import { employeeAssignmentsService } from '@/services/employee-assignments.service'
import { branchesService } from '@/services/branches.service'
import { departmentsService } from '@/services/departments.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { studyGroupsService } from '@/services/study-groups.service'
import { studyLevelsService } from '@/services/study-levels.service'
import { academicSemestersService } from '@/services/academic-semesters.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Trash2, Pencil, ArrowRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { EmployeeAssignment, Branch, Department, StudySubject, StudyGroup, StudyLevel, AcademicSemester } from '@/types'

export default function EmployeeAssignmentsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const employeeId = Number(id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EmployeeAssignment | null>(null)
  const [formData, setFormData] = useState({
    branch_id: 0,
    department_id: 0,
    study_subject_id: 0,
    study_group_id: 0,
    study_level_id: 0,
    academic_semester_id: 0,
  })
  const [apiError, setApiError] = useState('')

  const { data: employee } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesService.getById(employeeId),
  })

  const { data: assignments } = useQuery({
    queryKey: ['employee-assignments', id],
    queryFn: () => employeeAssignmentsService.getByEmployee(employeeId),
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesService.getAll(),
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const { data: groups } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => studyGroupsService.getAll(),
  })

  const { data: levels } = useQuery({
    queryKey: ['study-levels'],
    queryFn: () => studyLevelsService.getAll(),
  })

  const { data: semesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => academicSemestersService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => employeeAssignmentsService.create({
      employee_id: employeeId,
      branch_id: formData.branch_id || null,
      department_id: formData.department_id || null,
      study_subject_id: formData.study_subject_id || null,
      study_group_id: formData.study_group_id || null,
      study_level_id: formData.study_level_id || null,
      academic_semester_id: formData.academic_semester_id || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assignments', id] })
      handleClose()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { status?: number; data?: { error?: string } } }
      setApiError(error?.response?.status === 409 ? 'هذا الربط موجود بالفعل' : (error?.response?.data?.error || 'حدث خطأ أثناء الإضافة'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => employeeAssignmentsService.update(editingItem!.id, {
      branch_id: formData.branch_id || null,
      department_id: formData.department_id || null,
      study_subject_id: formData.study_subject_id || null,
      study_group_id: formData.study_group_id || null,
      study_level_id: formData.study_level_id || null,
      academic_semester_id: formData.academic_semester_id || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-assignments', id] })
      handleClose()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { status?: number; data?: { error?: string } } }
      setApiError(error?.response?.status === 409 ? 'هذا الربط موجود بالفعل' : (error?.response?.data?.error || 'حدث خطأ أثناء التعديل'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (aid: number) => employeeAssignmentsService.delete(aid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee-assignments', id] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const duplicateExists = useMemo(() => {
    if (!assignments) return false
    return assignments.some((a) =>
      (editingItem && a.id === editingItem.id) ? false :
      (a.branch_id || 0) === (formData.branch_id || 0) &&
      (a.department_id || 0) === (formData.department_id || 0) &&
      (a.study_subject_id || 0) === (formData.study_subject_id || 0) &&
      (a.study_group_id || 0) === (formData.study_group_id || 0) &&
      (a.study_level_id || 0) === (formData.study_level_id || 0) &&
      (a.academic_semester_id || 0) === (formData.academic_semester_id || 0)
    )
  }, [assignments, formData, editingItem])

  const atLeastOne = formData.branch_id || formData.department_id || formData.study_subject_id || formData.study_group_id || formData.study_level_id || formData.academic_semester_id

  const handleOpen = (item?: EmployeeAssignment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        branch_id: item.branch_id || 0,
        department_id: item.department_id || 0,
        study_subject_id: item.study_subject_id || 0,
        study_group_id: item.study_group_id || 0,
        study_level_id: item.study_level_id || 0,
        academic_semester_id: item.academic_semester_id || 0,
      })
    } else {
      setEditingItem(null)
      setFormData({
        branch_id: 0,
        department_id: 0,
        study_subject_id: 0,
        study_group_id: 0,
        study_level_id: 0,
        academic_semester_id: 0,
      })
    }
    setApiError('')
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({
      branch_id: 0,
      department_id: 0,
      study_subject_id: 0,
      study_group_id: 0,
      study_level_id: 0,
      academic_semester_id: 0,
    })
    setApiError('')
  }

  const handleSubmit = () => {
    if (!atLeastOne || duplicateExists) return
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const groupLabel = (g: StudyGroup) =>
    g.group_type ? `${g.group_name} (${g.group_type})` : g.group_name

  const subjectLabel = (s: StudySubject) =>
    s.subject_code ? `${s.subject_name} - ${s.subject_code}` : s.subject_name

  const semesterLabel = (s: AcademicSemester) =>
    s.is_current ? `${s.semester_name} ★` : s.semester_name

  const renderGroupName = (a: EmployeeAssignment) =>
    a.group_name && a.group_name.includes('(') ? a.group_name : a.group_name

  const columns: Column<EmployeeAssignment>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'branch_name', label: 'الفرع', sortable: true },
    { key: 'department_name', label: 'القسم', sortable: true },
    {
      key: 'subject_name',
      label: 'المادة',
      sortable: true,
      render: (a) => a.subject_name && a.subject_code ? `${a.subject_name} - ${a.subject_code}` : (a.subject_name || ''),
    },
    {
      key: 'group_name',
      label: 'المجموعة',
      sortable: true,
      render: (a) => {
        if (!a.group_name) return ''
        const g = (groups || []).find((gr) => gr.group_name === a.group_name)
        return g?.group_type ? `${a.group_name} (${g.group_type})` : a.group_name
      },
    },
    { key: 'level_name', label: 'المستوى', sortable: true },
    {
      key: 'semester_name',
      label: 'الترم',
      sortable: true,
      render: (a) => {
        if (!a.semester_name) return ''
        const s = (semesters || []).find((sem) => sem.semester_name === a.semester_name)
        return s?.is_current ? `${a.semester_name} ★` : a.semester_name
      },
    },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (a) => formatDateTime(a.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title={`توزيع - ${employee?.full_name || ''}`}
        description="ربط الموظف بالفروع والأقسام والمواد والمجموعات والمستويات والترمات الدراسية"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowRight className="h-4 w-4 ml-1" /> رجوع
            </Button>
            <Button onClick={() => handleOpen()} size="sm">
              <Plus className="h-4 w-4 ml-1" /> إضافة ربط
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={assignments || []}
            searchable
            searchPlaceholder="بحث في الارتباطات..."
            actions={(a) => (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => handleOpen(a)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف الربط', message: 'هل أنت متأكد من حذف هذا الربط؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(a.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            emptyMessage="لا توجد ارتباطات لهذا الموظف"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الربط' : 'إضافة ربط جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending} disabled={!atLeastOne || duplicateExists}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            label="الفرع"
            value={formData.branch_id}
            onChange={(v) => setFormData({ ...formData, branch_id: Number(v) })}
            placeholder="اختر الفرع..."
            options={(branches || []).map((b: Branch) => ({ value: b.id, label: b.branch_name }))}
          />

          <SearchableSelect
            label="القسم"
            value={formData.department_id}
            onChange={(v) => setFormData({ ...formData, department_id: Number(v) })}
            placeholder="اختر القسم..."
            options={(departments || []).map((d: Department) => ({ value: d.id, label: d.department_name }))}
          />

          <SearchableSelect
            label="المادة"
            value={formData.study_subject_id}
            onChange={(v) => setFormData({ ...formData, study_subject_id: Number(v) })}
            placeholder="اختر المادة..."
            options={(subjects || []).map((s: StudySubject) => ({ value: s.id, label: subjectLabel(s) }))}
          />

          <SearchableSelect
            label="المجموعة الدراسية"
            value={formData.study_group_id}
            onChange={(v) => setFormData({ ...formData, study_group_id: Number(v) })}
            placeholder="اختر المجموعة..."
            options={(groups || []).map((g: StudyGroup) => ({ value: g.id, label: groupLabel(g) }))}
          />

          <SearchableSelect
            label="المستوى الدراسي"
            value={formData.study_level_id}
            onChange={(v) => setFormData({ ...formData, study_level_id: Number(v) })}
            placeholder="اختر المستوى..."
            options={(levels || []).map((l: StudyLevel) => ({ value: l.id, label: l.level_name }))}
          />

          <SearchableSelect
            label="الترم الدراسي"
            value={formData.academic_semester_id}
            onChange={(v) => setFormData({ ...formData, academic_semester_id: Number(v) })}
            placeholder="اختر الترم..."
            options={(semesters || []).map((s: AcademicSemester) => ({ value: s.id, label: semesterLabel(s) }))}
          />
        </div>

        {duplicateExists && (
          <p className="text-sm text-red-500 mt-3">هذا الربط موجود بالفعل في القائمة</p>
        )}

        {apiError && (
          <p className="text-sm text-red-500 mt-3">{apiError}</p>
        )}

        {!atLeastOne && (
          <p className="text-sm text-muted-foreground mt-3">اختر حقلًا واحدًا على الأقل</p>
        )}
      </Modal>
      {confirmModal}
    </div>
  )
}
