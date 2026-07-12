'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsService } from '@/services/students.service'
import { collegesService } from '@/services/colleges.service'
import { departmentsService } from '@/services/departments.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2, GraduationCap, CheckCircle2, XCircle } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import type { Student, College, Department, StudyLevel, StudyGroup, AcademicSemester } from '@/types'

export default function StudentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    student_number: '',
    full_name: '',
    email: '',
    phone: '',
    college_id: 0,
    department_id: 0,
    study_level_id: 0,
    study_group_id: 0,
    academic_semester_id: 0,
    status: 'active',
    password: '',
    photo: '',
  })

  const { data } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
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
    queryFn: async () => {
      const res = await fetch('/api/study-groups')
      return res.json() as Promise<StudyGroup[]>
    },
  })

  const { data: academicSemesters } = useQuery({
    queryKey: ['academic-semesters'],
    queryFn: async () => {
      const res = await fetch('/api/academic-semesters')
      return res.json() as Promise<AcademicSemester[]>
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => studentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      handleClose()
    },
    onError: (err) => {
      console.error('Create error:', err)
      alert('فشل الإضافة: ' + (err instanceof Error ? err.message : 'خطأ غير معروف'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => studentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      handleClose()
    },
    onError: (err) => {
      console.error('Update error:', err)
      const axiosErr = err as { response?: { data?: unknown; status?: number } }
      const detail = axiosErr?.response?.data
        ? JSON.stringify(axiosErr.response.data)
        : (err instanceof Error ? err.message : 'خطأ غير معروف')
      alert('فشل التحديث: ' + detail)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        student_number: student.student_number,
        full_name: student.full_name,
        email: student.email || '',
        phone: student.phone || '',
        college_id: student.college_id || 0,
        department_id: student.department_id || 0,
        study_level_id: student.study_level_id || 0,
        study_group_id: student.study_group_id || 0,
        academic_semester_id: student.academic_semester_id || 0,
        status: student.status || 'active',
        password: '',
        photo: student.photo || '',
      })
    } else {
      setEditingStudent(null)
      setFormData({
        student_number: '', full_name: '', email: '', phone: '',
        college_id: 0, department_id: 0, study_level_id: 0,
        study_group_id: 0, academic_semester_id: 0, status: 'active',
        password: '', photo: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
    setFormData({
      student_number: '', full_name: '', email: '', phone: '',
      college_id: 0, department_id: 0, study_level_id: 0,
      study_group_id: 0, academic_semester_id: 0, status: 'active',
      password: '', photo: '',
    })
  }

  const handleSubmit = () => {
    if (!String(formData.student_number).trim() || !String(formData.full_name).trim()) return
    const payload: Record<string, unknown> = { ...formData }
    if (!payload.photo) delete payload.photo
    if (!payload.password) delete payload.password
    console.log('Submitting payload:', JSON.stringify(payload, null, 2))
    if (editingStudent) updateMutation.mutate({ id: editingStudent.id, data: payload })
    else createMutation.mutate(payload)
  }

  const filteredDepartments = (departments || []).filter(
    (d: Department) => !formData.college_id || d.college_id === formData.college_id
  )

  const filteredGroups = (studyGroups || []).filter(
    (g: StudyGroup) => !formData.college_id || g.college_id === formData.college_id
  )

  const columns: Column<Student>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_number', label: 'رقم القيد', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'department_name', label: 'القسم' },
    { key: 'level_name', label: 'المستوى' },
    { key: 'group_name', label: 'المجموعة' },
    { key: 'semester_name', label: 'الترم' },
    {
      key: 'status', label: 'الحالة',
      render: (s) => s.status === 'active'
        ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> نشط</span>
        : <span className="inline-flex items-center gap-1 text-muted-foreground"><XCircle className="h-4 w-4" /> منتهي</span>,
    },
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
        title="الطلاب"
        description="إدارة بيانات الطلاب الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة طالب
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن طالب..."
            id="students-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الطلاب')}
            onExportPDF={() => exportToPDF('students-table', 'الطلاب')}
            actions={(student) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(student)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف طالب', message: 'هل أنت متأكد من حذف هذا الطالب؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(student.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد بيانات طلاب بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingStudent ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex justify-center">
            <AvatarUpload
              currentImage={formData.photo}
              onImageChange={(filename) => setFormData({ ...formData, photo: filename || '' })}
              size="lg"
              label="الصورة الشخصية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم القيد *</label>
            <Input
              value={formData.student_number}
              onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
              placeholder="أدخل رقم قيد الطالب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="أدخل اسم الطالب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@ust.edu"
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
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <Select
              value={String(formData.college_id)}
              onChange={(e) => setFormData({ ...formData, college_id: Number(e.target.value), department_id: 0, study_group_id: 0 })}
              placeholder="اختر الكلية"
              options={(colleges || []).map((c: College) => ({ value: c.id, label: c.college_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم الدراسي</label>
            <Select
              value={String(formData.department_id)}
              onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
              placeholder="اختر القسم"
              options={filteredDepartments.map((d: Department) => ({ value: d.id, label: d.department_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المستوى الدراسي</label>
            <Select
              value={String(formData.study_level_id)}
              onChange={(e) => setFormData({ ...formData, study_level_id: Number(e.target.value) })}
              placeholder="اختر المستوى"
              options={(studyLevels || []).map((s: StudyLevel) => ({ value: s.id, label: s.level_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المجموعة الدراسية</label>
            <Select
              value={String(formData.study_group_id)}
              onChange={(e) => setFormData({ ...formData, study_group_id: Number(e.target.value) })}
              placeholder="اختر المجموعة"
              options={filteredGroups.map((g: StudyGroup) => ({ value: g.id, label: `${g.group_name} (${g.group_type})` }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الترم الدراسي</label>
            <Select
              value={String(formData.academic_semester_id)}
              onChange={(e) => setFormData({ ...formData, academic_semester_id: Number(e.target.value) })}
              placeholder="اختر الترم"
              options={(academicSemesters || []).map((s: AcademicSemester) => ({ value: s.id, label: s.semester_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingStudent ? 'اترك فارغاً إذا لم ترد التغيير' : 'أدخل كلمة المرور'}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'graduated', label: 'متخرج' },
                { value: 'suspended', label: 'موقوف' },
                { value: 'withdrawn', label: 'منسحب' },
              ]}
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
