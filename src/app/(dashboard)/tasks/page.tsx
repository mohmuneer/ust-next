'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksService } from '@/services/tasks.service'
import { usersService } from '@/services/users.service'
import { requestsService } from '@/services/requests.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Trash2, CheckCircle2, UserCheck, Plus, Pencil, X,
  AlertTriangle, Clock, CheckCircle, XCircle, Star, Calendar, Image as ImageIcon,
} from 'lucide-react'
import type { Task, User, Request } from '@/types'
import { getStatusColor, getStatusText, getPriorityColor, formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

const statusTabs: { key: string; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: 'الكل', icon: Clock },
  { key: 'Pending', label: 'قيد الانتظار', icon: Clock },
  { key: 'In Progress', label: 'قيد التنفيذ', icon: AlertTriangle },
  { key: 'Completed', label: 'مكتمل', icon: CheckCircle },
  { key: 'Cancelled', label: 'ملغي', icon: XCircle },
]

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [transferData, setTransferData] = useState({ new_technician_id: 0, transfer_note: '' })
  const [formData, setFormData] = useState({
    request_id: 0,
    assigned_to: 0,
    priority: 'Medium' as string,
    deadline: '',
    details: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getAll(),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const { data: pendingRequests } = useQuery({
    queryKey: ['requests-pending'],
    queryFn: async () => {
      const res = await fetch('/api/requests?status=Pending')
      return res.json() as Promise<Request[]>
    },
  })

  const stats = useMemo(() => {
    if (!tasks) return { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 }
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      cancelled: tasks.filter(t => t.status === 'Cancelled').length,
    }
  }, [tasks])

  const completeMutation = useMutation({
    mutationFn: () => tasksService.complete({ task_id: selectedTask!.id, completion_notes: completionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsCompleteOpen(false)
      setSelectedTask(null)
      setCompletionNotes('')
    },
  })

  const transferMutation = useMutation({
    mutationFn: () => tasksService.transfer({ task_id: selectedTask!.id, ...transferData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsTransferOpen(false)
      setSelectedTask(null)
      setTransferData({ new_technician_id: 0, transfer_note: '' })
    },
  })

  const createMutation = useMutation({
    mutationFn: () => tasksService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => tasksService.update(selectedTask!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsEditOpen(false)
      setSelectedTask(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    if (statusFilter === 'all') return tasks
    return tasks.filter((t) => t.status === statusFilter)
  }, [tasks, statusFilter])

  const supportUsers = useMemo(() => {
    return (users || []).filter((u) => {
      const code = (u.role_code || '').toLowerCase()
      return code === 'support'
    })
  }, [users])

  const resetForm = () => {
    setFormData({ request_id: 0, assigned_to: 0, priority: 'Medium', deadline: '', details: '' })
    setFormErrors({})
  }

  const openEdit = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      request_id: task.request_id,
      assigned_to: task.assigned_to,
      priority: task.priority || 'Medium',
      deadline: task.deadline ? task.deadline.slice(0, 16) : '',
      details: task.details || '',
    })
    setIsEditOpen(true)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.request_id) errs.request_id = 'الرجاء اختيار البلاغ'
    if (!formData.assigned_to) errs.assigned_to = 'الرجاء اختيار الفني'
    setFormErrors(errs)
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

  const columns: Column<Task>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'problem_image',
      label: 'صورة',
      render: (t) => (
        t.problem_image
          ? <img src={`/uploads/${t.problem_image}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
          : <ImageIcon className="w-5 h-5 text-muted-foreground" />
      ),
    },
    { key: 'technician_name', label: 'الفني', sortable: true },
    { key: 'requester_name', label: 'مقدم الطلب' },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'group_name', label: 'نوع المشكلة' },
    { key: 'location_name', label: 'الموقع' },
    { key: 'course_name', label: 'المقرر' },
    {
      key: 'priority',
      label: 'الأولوية',
      sortable: true,
      render: (t) => (
        <Badge variant={getPriorityColor(t.priority) as 'danger' | 'warning' | 'success'}>
          {t.priority === 'High' ? 'عالية' : t.priority === 'Medium' ? 'متوسطة' : 'عادية'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (t) => (
        <Badge variant={getStatusColor(t.status) as 'danger' | 'warning' | 'success' | 'info'}>
          {getStatusText(t.status)}
        </Badge>
      ),
    },
    {
      key: 'deadline',
      label: 'الموعد النهائي',
      render: (t) => t.deadline ? formatDateTime(t.deadline) : '---',
    },
    {
      key: 'rating',
      label: 'التقييم',
      render: (t) => (
        t.rating
          ? <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" />{t.rating}/5</span>
          : '---'
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (t) => formatDateTime(t.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة ومتابعة المهام الفنية"
        description="عرض وإدارة المهام المسندة للفنيين"
        actions={
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} size="sm">
            <Plus className="h-4 w-4 ml-1" /> مهمة جديدة
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-muted-foreground' },
          { label: 'قيد الانتظار', value: stats.pending, color: 'text-yellow-600' },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'مكتمل', value: stats.completed, color: 'text-green-600' },
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
            data={filteredTasks}
            searchable
            searchPlaceholder="بحث عن مهمة..."
            id="tasks-table"
            onExportExcel={() => exportToExcel(filteredTasks, columns, 'المهام')}
            onExportPDF={() => exportToPDF('tasks-table', 'إدارة ومتابعة المهام الفنية')}
            actions={(task) => (
              <div className="flex items-center gap-2">
                {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedTask(task); setIsCompleteOpen(true) }}
                    >
                      <CheckCircle2 className="h-4 w-4 ml-1" /> إنجاز
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedTask(task); setTransferData({ new_technician_id: 0, transfer_note: '' }); setIsTransferOpen(true) }}
                    >
                      <UserCheck className="h-4 w-4 ml-1" /> تحويل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(task)}
                    >
                      <Pencil className="h-4 w-4 ml-1" /> تعديل
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedTask(task); setIsViewOpen(true) }}
                >
                  عرض
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مهمة', message: 'هل أنت متأكد من حذف هذه المهمة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(task.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مهام بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedTask(null) }}
        title="تفاصيل المهمة"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => { setIsViewOpen(false); setSelectedTask(null) }}>
            إغلاق
          </Button>
        }
      >
        {selectedTask && <TaskDetails task={selectedTask} />}
      </Modal>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm() }}
        title="إضافة مهمة جديدة"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm() }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              <Plus className="h-4 w-4 ml-1" /> إضافة المهمة
            </Button>
          </>
        }
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          errors={formErrors}
          pendingRequests={pendingRequests}
          supportUsers={supportUsers}
        />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedTask(null); resetForm() }}
        title="تعديل المهمة"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedTask(null); resetForm() }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>
              حفظ التغييرات
            </Button>
          </>
        }
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          errors={formErrors}
          pendingRequests={pendingRequests}
          supportUsers={supportUsers}
          isEdit
        />
      </Modal>

      <Modal
        isOpen={isCompleteOpen}
        onClose={() => { setIsCompleteOpen(false); setSelectedTask(null); setCompletionNotes('') }}
        title="إنجاز المهمة"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsCompleteOpen(false); setSelectedTask(null); setCompletionNotes('') }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button onClick={() => completeMutation.mutate()} isLoading={completeMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 ml-1" /> تأكيد الإنجاز
            </Button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">رقم المهمة</span>
                <span className="text-sm font-bold">#{selectedTask.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">مقدم البلاغ</span>
                <span className="text-sm">{selectedTask.requester_name || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الموقع</span>
                <span className="text-sm">{selectedTask.location_name || '---'}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                ملاحظات الإنجاز (اختياري)
              </label>
              <textarea
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="اكتب ملاحظات الإنجاز هنا..."
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isTransferOpen}
        onClose={() => { setIsTransferOpen(false); setSelectedTask(null); setTransferData({ new_technician_id: 0, transfer_note: '' }) }}
        title="تحويل المهمة"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsTransferOpen(false); setSelectedTask(null); setTransferData({ new_technician_id: 0, transfer_note: '' }) }}>
              <X className="h-4 w-4 ml-1" /> إلغاء
            </Button>
            <Button
              onClick={() => transferMutation.mutate()}
              isLoading={transferMutation.isPending}
              disabled={!transferData.new_technician_id}
            >
              <UserCheck className="h-4 w-4 ml-1" /> تحويل
            </Button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">رقم المهمة</span>
                <span className="text-sm font-bold">#{selectedTask.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الفني الحالي</span>
                <span className="text-sm">{selectedTask.technician_name || '---'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الموقع</span>
                <span className="text-sm">{selectedTask.location_name || '---'}</span>
              </div>
            </div>
            <div>
              <Select
                label="الفني الجديد"
                placeholder="اختر الفني"
                value={String(transferData.new_technician_id)}
                onChange={(e) => setTransferData({ ...transferData, new_technician_id: Number(e.target.value) })}
                options={supportUsers.map((u: User) => ({ value: u.id, label: u.full_name }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                سبب التحويل (اختياري)
              </label>
              <textarea
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                value={transferData.transfer_note}
                onChange={(e) => setTransferData({ ...transferData, transfer_note: e.target.value })}
                placeholder="مثال: إجازة المهندس الحالي، إعادة توزيع الأحمال..."
              />
            </div>
          </div>
        )}
      </Modal>
      {confirmModal}
    </div>
  )
}


function TaskForm({
  formData, setFormData, errors, pendingRequests, supportUsers, isEdit,
}: {
  formData: any
  setFormData: (d: any) => void
  errors: Record<string, string>
  pendingRequests?: Request[]
  supportUsers?: User[]
  isEdit?: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Select
          label="البلاغ"
          placeholder="اختر البلاغ"
          value={String(formData.request_id)}
          onChange={(e) => setFormData({ ...formData, request_id: Number(e.target.value) })}
          options={(pendingRequests || []).map((r: Request) => ({
            value: r.id,
            label: `#${r.id} - ${r.details?.slice(0, 60)}...`,
          }))}
          required
        />
        {errors.request_id && <p className="text-xs text-danger mt-1">{errors.request_id}</p>}
      </div>
      <div>
        <Select
          label="الفني المسؤول"
          placeholder="اختر الفني"
          value={String(formData.assigned_to)}
          onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) })}
          options={(supportUsers || []).map((u: User) => ({ value: u.id, label: u.full_name }))}
          required
        />
        {errors.assigned_to && <p className="text-xs text-danger mt-1">{errors.assigned_to}</p>}
      </div>
      <div>
        <Select
          label="درجة الأهمية"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          options={[
            { value: 'Normal', label: 'عادي' },
            { value: 'Medium', label: 'متوسط' },
            { value: 'High', label: 'عالية' },
            { value: 'Critical', label: 'حرج جداً' },
          ]}
        />
      </div>
      <div>
        <Input
          label="الموعد النهائي"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            تفاصيل المهمة
          </label>
          <textarea
            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="اكتب تفاصيل المهمة وتوجيهات للفني..."
          />
        </div>
      </div>
    </div>
  )
}

function TaskDetails({ task }: { task: Task }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">رقم المهمة</p>
          <p className="text-sm font-bold">#{task.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">رقم البلاغ</p>
          <p className="text-sm">#{task.request_id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الفني</p>
          <p className="text-sm">{task.technician_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">مقدم الطلب</p>
          <p className="text-sm">{task.requester_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الفرع</p>
          <p className="text-sm">{task.branch_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الكلية</p>
          <p className="text-sm">{task.college_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">نوع المشكلة</p>
          <p className="text-sm">{task.group_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الموقع</p>
          <p className="text-sm">{task.location_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">المقرر</p>
          <p className="text-sm">{task.course_name || '---'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الأولوية</p>
          <Badge variant={getPriorityColor(task.priority) as 'danger' | 'warning' | 'success'}>
            {task.priority === 'High' ? 'عالية' : task.priority === 'Medium' ? 'متوسطة' : 'عادية'}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">الحالة</p>
          <Badge variant={getStatusColor(task.status) as 'danger' | 'warning' | 'success' | 'info'}>
            {getStatusText(task.status)}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">تاريخ الإنشاء</p>
          <p className="text-sm">{formatDateTime(task.created_at)}</p>
        </div>
        {task.deadline && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">الموعد النهائي</p>
            <p className="text-sm"><Calendar className="h-3 w-3 inline ml-1" />{formatDateTime(task.deadline)}</p>
          </div>
        )}
      </div>

      {task.details && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">ملاحظات المهمة</p>
          <p className="text-sm leading-relaxed bg-muted/30 rounded-xl p-3 whitespace-pre-wrap">{task.details}</p>
        </div>
      )}

      {(task.req_details || task.request_details) && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">تفاصيل البلاغ</p>
          <p className="text-sm leading-relaxed bg-muted/30 rounded-xl p-3 whitespace-pre-wrap">
            {task.request_details || task.req_details}
          </p>
        </div>
      )}

      {task.problem_image && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">صورة المشكلة</p>
          <img
            src={`/uploads/${task.problem_image}`}
            alt="صورة المشكلة"
            className="max-w-full max-h-96 rounded-xl border border-border"
          />
        </div>
      )}

      {task.rating && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-1.5">التقييم</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{'★'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}</span>
            {task.rating_comment && <p className="text-sm text-muted-foreground">- {task.rating_comment}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
