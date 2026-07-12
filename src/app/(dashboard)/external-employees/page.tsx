'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { externalEmployeesService } from '@/services/external-employees.service'
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
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { ExternalEmployee, Branch, Department, StudySubject, StudyGroup, StudyLevel, AcademicSemester } from '@/types'

export default function ExternalEmployeesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExternalEmployee | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    contract_type: 'semester',
    branch_id: 0,
    department_id: 0,
    study_subject_id: 0,
    study_group_id: 0,
    study_level_id: 0,
    academic_semester_id: 0,
    start_date: '',
    end_date: '',
    hours_count: '',
    hourly_rate: '',
    work_time: '',
    notes: '',
    status: 'active',
  })

  const { data } = useQuery({
    queryKey: ['external-employees'],
    queryFn: () => externalEmployeesService.getAll(),
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
    mutationFn: () => externalEmployeesService.create({
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      password: formData.password || null,
      contract_type: formData.contract_type,
      branch_id: formData.branch_id || null,
      department_id: formData.department_id || null,
      study_subject_id: formData.study_subject_id || null,
      study_group_id: formData.study_group_id || null,
      study_level_id: formData.study_level_id || null,
      academic_semester_id: formData.academic_semester_id || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      hours_count: formData.hours_count ? Number(formData.hours_count) : null,
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
      work_time: formData.work_time || null,
      notes: formData.notes || null,
      status: formData.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-employees'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => externalEmployeesService.update(editingItem!.id, {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      password: formData.password || null,
      contract_type: formData.contract_type,
      branch_id: formData.branch_id || null,
      department_id: formData.department_id || null,
      study_subject_id: formData.study_subject_id || null,
      study_group_id: formData.study_group_id || null,
      study_level_id: formData.study_level_id || null,
      academic_semester_id: formData.academic_semester_id || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      hours_count: formData.hours_count ? Number(formData.hours_count) : null,
      hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
      work_time: formData.work_time || null,
      notes: formData.notes || null,
      status: formData.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-employees'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => externalEmployeesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['external-employees'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: ExternalEmployee) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        full_name: item.full_name,
        email: item.email || '',
        phone: item.phone || '',
        password: '',
        contract_type: item.contract_type,
        branch_id: item.branch_id || 0,
        department_id: item.department_id || 0,
        study_subject_id: item.study_subject_id || 0,
        study_group_id: item.study_group_id || 0,
        study_level_id: item.study_level_id || 0,
        academic_semester_id: item.academic_semester_id || 0,
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        hours_count: item.hours_count?.toString() || '',
        hourly_rate: item.hourly_rate?.toString() || '',
        work_time: item.work_time || '',
        notes: item.notes || '',
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({
        full_name: '', email: '', phone: '', password: '', contract_type: 'semester',
        branch_id: 0, department_id: 0, study_subject_id: 0, study_group_id: 0,
        study_level_id: 0, academic_semester_id: 0,
        start_date: '', end_date: '', hours_count: '', hourly_rate: '', work_time: '', notes: '', status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = () => {
    if (!formData.full_name.trim()) return
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

  const contractTypeLabels: Record<string, string> = {
    semester: 'ترم دراسي',
    yearly: 'سنوي',
    monthly: 'شهري',
  }

  const columns: Column<ExternalEmployee>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد', sortable: true },
    { key: 'phone', label: 'الهاتف', sortable: true },
    {
      key: 'contract_type',
      label: 'نوع التعاقد',
      sortable: true,
      render: (e) => contractTypeLabels[e.contract_type] || e.contract_type,
    },
    { key: 'branch_name', label: 'الفرع', sortable: true },
    { key: 'department_name', label: 'القسم', sortable: true },
    {
      key: 'subject_name',
      label: 'المادة',
      sortable: true,
      render: (e) => e.subject_code ? `${e.subject_name} - ${e.subject_code}` : (e.subject_name || ''),
    },
    { key: 'level_name', label: 'المستوى', sortable: true },
    { key: 'semester_name', label: 'الترم', sortable: true },
    {
      key: 'hours_count',
      label: 'عدد الساعات',
      sortable: true,
      render: (e) => e.hours_count ? `${e.hours_count} ساعة` : '',
    },
    {
      key: 'hourly_rate',
      label: 'الأجر بالساعة',
      sortable: true,
      render: (e) => e.hourly_rate ? `${e.hourly_rate} ريال` : '',
    },
    { key: 'work_time', label: 'وقت الدوام', sortable: true },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (e) => (
        <Badge variant={e.status === 'active' ? 'success' : 'secondary'}>
          {e.status === 'active' ? 'نشط' : 'منتهي'}
        </Badge>
      ),
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
        title="المتعاقدون الخارجيون"
        description="إدارة المتعاقدين والمدرسين المؤقتين"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة متعاقد
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن متعاقد..."
            actions={(item) => (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف متعاقد', message: 'هل أنت متأكد من حذف هذا المتعاقد؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            emptyMessage="لا توجد بيانات متعاقدين بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل المتعاقد' : 'إضافة متعاقد جديد'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="أدخل اسم المتعاقد..."
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
                placeholder="أدخل رقم الهاتف..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{editingItem ? 'كلمة المرور (اترك فارغاً لعدم التغيير)' : 'كلمة المرور'}</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingItem ? 'اترك فارغاً لعدم التغيير' : 'أدخل كلمة المرور...'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نوع التعاقد</label>
              <Select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                options={[
                  { value: 'semester', label: 'ترم دراسي' },
                  { value: 'yearly', label: 'سنوي' },
                  { value: 'monthly', label: 'شهري' },
                ]}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect
              label="المجموعة"
              value={formData.study_group_id}
              onChange={(v) => setFormData({ ...formData, study_group_id: Number(v) })}
              placeholder="اختر المجموعة..."
              options={(groups || []).map((g: StudyGroup) => ({ value: g.id, label: groupLabel(g) }))}
            />
            <SearchableSelect
              label="المستوى"
              value={formData.study_level_id}
              onChange={(v) => setFormData({ ...formData, study_level_id: Number(v) })}
              placeholder="اختر المستوى..."
              options={(levels || []).map((l: StudyLevel) => ({ value: l.id, label: l.level_name }))}
            />
            <SearchableSelect
              label="الترم"
              value={formData.academic_semester_id}
              onChange={(v) => setFormData({ ...formData, academic_semester_id: Number(v) })}
              placeholder="اختر الترم..."
              options={(semesters || []).map((s: AcademicSemester) => ({ value: s.id, label: s.is_current ? `${s.semester_name} ★` : s.semester_name }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">عدد الساعات</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.hours_count}
                onChange={(e) => setFormData({ ...formData, hours_count: e.target.value })}
                placeholder="مثال: 36"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الأجر بالساعة (ريال)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                placeholder="مثال: 150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوقت المناسب للدوام</label>
              <Input
                value={formData.work_time}
                onChange={(e) => setFormData({ ...formData, work_time: e.target.value })}
                placeholder="مثال: الفترة الصباحية 8-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'active', label: 'نشط' },
                  { value: 'completed', label: 'منتهي' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
