'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestsService } from '@/services/requests.service'
import { branchesService } from '@/services/branches.service'
import { collegesService } from '@/services/colleges.service'
import { labsService } from '@/services/labs.service'
import { departmentsService } from '@/services/departments.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Trash2, Eye, Plus, Pencil, X,
  AlertTriangle, Clock, CheckCircle, XCircle, Image as ImageIcon,
  Building2, User, Calendar, Star, MessageSquare,
} from 'lucide-react'
import type {
  Request, Priority, Branch, College, Lab, Department, StudyLevel, ProblemGroup,
} from '@/types'
import { getStatusColor, getStatusText, getPriorityColor, formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

const statusTabs: { key: string; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: 'الكل', icon: Clock },
  { key: 'Pending', label: 'معلق', icon: Clock },
  { key: 'In Progress', label: 'قيد التنفيذ', icon: AlertTriangle },
  { key: 'Resolved', label: 'تم الحل', icon: CheckCircle },
  { key: 'Cancelled', label: 'ملغي', icon: XCircle },
]

export default function RequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [formData, setFormData] = useState({
    branch_id: 0,
    college_id: 0,
    lab_id: 0,
    department_id: 0,
    study_level_id: 0,
    issue_type_id: 0,
    location_name: '',
    priority: 'Medium' as Priority,
    details: '',
    course_name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getAll(),
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges-all'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: labs } = useQuery({
    queryKey: ['labs'],
    queryFn: () => labsService.getAll(),
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

  const { data: issueTypes } = useQuery({
    queryKey: ['issue-types'],
    queryFn: async () => {
      const res = await fetch('/api/issue-types')
      return res.json() as Promise<ProblemGroup[]>
    },
  })

  const stats = useMemo(() => {
    if (!requests) return { total: 0, pending: 0, inProgress: 0, resolved: 0, cancelled: 0 }
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      resolved: requests.filter(r => r.status === 'Resolved').length,
      cancelled: requests.filter(r => r.status === 'Cancelled').length,
    }
  }, [requests])

  const createMutation = useMutation({
    mutationFn: () => requestsService.create(formData as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => requestsService.update(selectedRequest!.id, formData as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      setIsEditOpen(false)
      setSelectedRequest(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => requestsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const filteredRequests = useMemo(() => {
    if (!requests) return []
    if (statusFilter === 'all') return requests
    return requests.filter((r) => r.status === statusFilter)
  }, [requests, statusFilter])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.branch_id) errs.branch_id = 'الرجاء اختيار الفرع'
    if (!formData.college_id) errs.college_id = 'الرجاء اختيار الكلية'
    if (!formData.issue_type_id) errs.issue_type_id = 'الرجاء اختيار نوع المشكلة'
    if (!formData.details.trim()) errs.details = 'الرجاء كتابة وصف المشكلة'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    createMutation.mutate()
  }

  const handleUpdate = () => {
    if (!validate()) return
    updateMutation.mutate()
  }

  const resetForm = () => {
    setFormData({
      branch_id: 0,
      college_id: 0,
      lab_id: 0,
      department_id: 0,
      study_level_id: 0,
      issue_type_id: 0,
      location_name: '',
      priority: 'Medium',
      details: '',
      course_name: '',
    })
    setErrors({})
  }

  const openEdit = (req: Request) => {
    setSelectedRequest(req)
    setFormData({
      branch_id: req.branch_id,
      college_id: req.college_id,
      lab_id: req.lab_id || 0,
      department_id: req.department_id || 0,
      study_level_id: req.study_level_id || 0,
      issue_type_id: req.issue_type_id,
      location_name: req.location_name || '',
      priority: req.priority,
      details: req.details,
      course_name: req.course_name || '',
    })
    setIsEditOpen(true)
  }

  const columns: Column<Request>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'problem_image',
      label: 'صورة',
      render: (r) => (
        r.problem_image
          ? <img src={`/uploads/${r.problem_image}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
          : <ImageIcon className="w-5 h-5 text-muted-foreground" />
      ),
    },
    { key: 'user_name', label: 'مقدم الطلب', sortable: true },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'location_name', label: 'الموقع' },
    { key: 'group_name', label: 'نوع المشكلة' },
    { key: 'course_name', label: 'المقرر' },
    {
      key: 'priority',
      label: 'الأولوية',
      sortable: true,
      render: (r) => (
        <Badge variant={getPriorityColor(r.priority) as 'danger' | 'warning' | 'success'}>
          {r.priority === 'High' ? 'عالية' : r.priority === 'Medium' ? 'متوسطة' : 'عادية'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (r) => (
        <Badge variant={getStatusColor(r.status) as 'danger' | 'warning' | 'success' | 'info'}>
          {getStatusText(r.status)}
        </Badge>
      ),
    },
    {
      key: 'technician_name',
      label: 'المهندس',
      render: (r) => r.technician_name || '---',
    },
    {
      key: 'deadline',
      label: 'الموعد النهائي',
      render: (r) => r.deadline ? formatDateTime(r.deadline) : '---',
    },
    {
      key: 'rating',
      label: 'التقييم',
      render: (r) => (
        r.rating
          ? <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" />{r.rating}/5</span>
          : '---'
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ التقديم',
      sortable: true,
      render: (r) => formatDateTime(r.created_at),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="البلاغات والطلبات"
        description="إدارة ومتابعة بلاغات المستخدمين"
        actions={
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} size="sm">
            <Plus className="h-4 w-4 ml-1" /> بلاغ جديد
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-muted-foreground' },
          { label: 'معلق', value: stats.pending, color: 'text-yellow-600' },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'تم الحل', value: stats.resolved, color: 'text-green-600' },
          { label: 'ملغي', value: stats.cancelled, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center py-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={filteredRequests}
            searchable
            searchPlaceholder="بحث عن بلاغ..."
            id="requests-table"
            onExportExcel={() => exportToExcel(filteredRequests, columns, 'البلاغات')}
            onExportPDF={() => exportToPDF('requests-table', 'البلاغات والطلبات')}
            actions={(req) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedRequest(req); setIsViewOpen(true) }}
                >
                  <Eye className="h-4 w-4 ml-1" /> عرض
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(req)}
                >
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف بلاغ', message: 'هل أنت متأكد من حذف هذا البلاغ؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(req.id)
                  }}
                  disabled={!!req.task_id}
                  title={req.task_id ? 'لا يمكن حذف بلاغ مرتبط بمهمة' : ''}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد بلاغات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm() }}
        title="بلاغ جديد"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm() }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button onClick={handleCreate} isLoading={isPending}>
              إرسال البلاغ
            </Button>
          </>
        }
      >
        <RequestForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          branches={branches}
          colleges={colleges}
          labs={labs}
          departments={departments}
          studyLevels={studyLevels}
          issueTypes={issueTypes}
        />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedRequest(null); resetForm() }}
        title="تعديل البلاغ"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedRequest(null); resetForm() }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button onClick={handleUpdate} isLoading={isPending}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <RequestForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          branches={branches}
          colleges={colleges}
          labs={labs}
          departments={departments}
          studyLevels={studyLevels}
          issueTypes={issueTypes}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedRequest(null) }}
        title="تفاصيل البلاغ"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => { setIsViewOpen(false); setSelectedRequest(null) }}>
            إغلاق
          </Button>
        }
      >
        {selectedRequest && <RequestDetails request={selectedRequest} />}
      </Modal>
      {confirmModal}
    </div>
  )
}


function RequestForm({
  formData, setFormData, errors, branches, colleges, labs, departments, studyLevels, issueTypes,
}: {
  formData: any
  setFormData: (d: any) => void
  errors: Record<string, string>
  branches?: Branch[]
  colleges?: College[]
  labs?: Lab[]
  departments?: Department[]
  studyLevels?: StudyLevel[]
  issueTypes?: ProblemGroup[]
}) {
  const filteredColleges = colleges?.filter(
    (c) => !formData.branch_id || c.branch_id === formData.branch_id
  ) || []

  const filteredLabs = labs?.filter(
    (l) => !formData.college_id || l.college_id === formData.college_id
  ) || []

  const filteredDepartments = departments?.filter(
    (d) => !formData.college_id || d.college_id === formData.college_id
  ) || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Select
          label="الفرع"
          placeholder="اختر الفرع"
          value={String(formData.branch_id)}
          onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value), college_id: 0, lab_id: 0, department_id: 0 })}
          options={(branches || []).map((b: Branch) => ({ value: b.id, label: b.branch_name }))}
          required
        />
        {errors.branch_id && <p className="text-xs text-danger mt-1">{errors.branch_id}</p>}
      </div>
      <div>
        <Select
          label="الكلية"
          placeholder="اختر الكلية"
          value={String(formData.college_id)}
          onChange={(e) => setFormData({ ...formData, college_id: Number(e.target.value) })}
          options={filteredColleges.map((c: College) => ({ value: c.id, label: c.college_name }))}
          required
        />
        {errors.college_id && <p className="text-xs text-danger mt-1">{errors.college_id}</p>}
      </div>
      <div>
        <Input
          label="رقم القاعة / الموقع"
          placeholder="مثال: Lab 04 أو قاعة 201"
          value={formData.location_name}
          onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
        />
      </div>
      <div>
        <Select
          label="المعمل"
          placeholder="اختر المعمل (اختياري)"
          value={String(formData.lab_id)}
          onChange={(e) => setFormData({ ...formData, lab_id: Number(e.target.value) })}
          options={filteredLabs.map((l: Lab) => ({ value: l.id, label: l.lab_name }))}
        />
      </div>
      <div>
        <Select
          label="القسم الدراسي"
          placeholder="اختر القسم (اختياري)"
          value={String(formData.department_id)}
          onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
          options={filteredDepartments.map((d: Department) => ({ value: d.id, label: d.department_name }))}
        />
      </div>
      <div>
        <Select
          label="المستوى الدراسي"
          placeholder="اختر المستوى (اختياري)"
          value={String(formData.study_level_id)}
          onChange={(e) => setFormData({ ...formData, study_level_id: Number(e.target.value) })}
          options={(studyLevels || []).map((s: StudyLevel) => ({ value: s.id, label: s.level_name }))}
        />
      </div>
      <div>
        <Select
          label="نوع المشكلة"
          placeholder="اختر تصنيف المشكلة"
          value={String(formData.issue_type_id)}
          onChange={(e) => setFormData({ ...formData, issue_type_id: Number(e.target.value) })}
          options={(issueTypes || []).map((g: ProblemGroup) => ({ value: g.id, label: g.group_name }))}
          required
        />
        {errors.issue_type_id && <p className="text-xs text-danger mt-1">{errors.issue_type_id}</p>}
      </div>
      <div>
        <Select
          label="درجة الأهمية"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
          options={[
            { value: 'Low', label: 'عادي' },
            { value: 'Medium', label: 'متوسط' },
            { value: 'High', label: 'طارئ (توقف محاضرة)' },
          ]}
        />
      </div>
      <div className="md:col-span-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            وصف المشكلة <span className="text-danger mr-1">*</span>
          </label>
          <textarea
            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="يرجى كتابة ما حدث، مثلاً: جهاز رقم 12 في المعمل لا يقلع..."
          />
          {errors.details && <p className="text-xs text-danger">{errors.details}</p>}
        </div>
      </div>
      <div>
        <Input
          label="اسم المقرر (اختياري)"
          placeholder="أدخل اسم المقرر إن وجد"
          value={formData.course_name}
          onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
        />
      </div>
    </div>
  )
}

function RequestDetails({ request }: { request: Request }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">رقم البلاغ</p>
          <p className="text-sm font-bold">#{request.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">مقدم الطلب</p>
          <p className="text-sm">{request.user_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الفرع</p>
          <p className="text-sm">{request.branch_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الكلية</p>
          <p className="text-sm">{request.college_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الموقع</p>
          <p className="text-sm">{request.location_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">المعمل</p>
          <p className="text-sm">{request.lab_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">القسم الدراسي</p>
          <p className="text-sm">{request.department_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">المستوى الدراسي</p>
          <p className="text-sm">{request.level_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">نوع المشكلة</p>
          <p className="text-sm">{request.group_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">المقرر</p>
          <p className="text-sm">{request.course_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الأولوية</p>
          <Badge variant={getPriorityColor(request.priority) as 'danger' | 'warning' | 'success'}>
            {request.priority === 'High' ? 'عالية' : request.priority === 'Medium' ? 'متوسطة' : 'عادية'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الحالة</p>
          <Badge variant={getStatusColor(request.status) as 'danger' | 'warning' | 'success' | 'info'}>
            {getStatusText(request.status)}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">تاريخ التقديم</p>
          <p className="text-sm">{formatDateTime(request.created_at)}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-1.5">وصف المشكلة</p>
        <p className="text-sm leading-relaxed bg-muted/30 rounded-xl p-3 whitespace-pre-wrap">{request.details}</p>
      </div>

      {request.problem_image && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">صورة المشكلة</p>
          <img
            src={`/uploads/${request.problem_image}`}
            alt="صورة المشكلة"
            className="max-w-full max-h-96 rounded-xl border border-border"
          />
        </div>
      )}

      {request.task_id && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">المهمة المسندة</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={
              request.task_status === 'Completed' ? 'success'
              : request.task_status === 'In Progress' ? 'info'
              : request.task_status === 'Cancelled' ? 'danger'
              : 'warning'
            }>
              {request.task_status ? getStatusText(request.task_status) : '---'}
            </Badge>
            <span className="text-sm">
              {request.technician_name ? `لـ ${request.technician_name}` : ''}
            </span>
            {request.deadline && (
              <span className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 inline ml-1" />
                {formatDateTime(request.deadline)}
              </span>
            )}
          </div>
        </div>
      )}

      {request.rating && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">تقييم الحل</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{'★'.repeat(request.rating)}{'☆'.repeat(5 - request.rating)}</span>
            {request.rating_comment && <p className="text-sm text-muted-foreground">- {request.rating_comment}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
