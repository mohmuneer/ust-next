'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesService } from '@/services/employees.service'
import { adminStructuresService } from '@/services/admin-structures.service'
import { jobTitlesService } from '@/services/job-titles.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, FileText, Link2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Employee, AdminStructure, JobTitle } from '@/types'

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    admin_structure_id: 0,
    job_title_id: 0,
    academic_degree: '',
    specialization: '',
    status: 'active',
  })

  const { data } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const { data: structures } = useQuery({
    queryKey: ['admin-structures'],
    queryFn: () => adminStructuresService.getAll(),
  })

  const { data: jobTitles } = useQuery({
    queryKey: ['job-titles'],
    queryFn: () => jobTitlesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => employeesService.create({
      ...formData,
      email: formData.email || null,
      phone: formData.phone || null,
      password: formData.password || null,
      admin_structure_id: formData.admin_structure_id || null,
      job_title_id: formData.job_title_id || null,
      academic_degree: formData.academic_degree || null,
      specialization: formData.specialization || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => employeesService.update(editingItem!.id, {
      ...formData,
      email: formData.email || null,
      phone: formData.phone || null,
      password: formData.password || null,
      admin_structure_id: formData.admin_structure_id || null,
      job_title_id: formData.job_title_id || null,
      academic_degree: formData.academic_degree || null,
      specialization: formData.specialization || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: Employee) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        employee_code: item.employee_code || '',
        full_name: item.full_name,
        email: item.email || '',
        phone: item.phone || '',
        password: '',
        admin_structure_id: item.admin_structure_id || 0,
        job_title_id: item.job_title_id || 0,
        academic_degree: item.academic_degree || '',
        specialization: item.specialization || '',
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({
        employee_code: '',
        full_name: '',
        email: '',
        phone: '',
        password: '',
        admin_structure_id: 0,
        job_title_id: 0,
        academic_degree: '',
        specialization: '',
        status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const columns: Column<Employee>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'employee_code', label: 'الكود', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد', sortable: true },
    { key: 'admin_structure_name', label: 'الهيكل', sortable: true },
    { key: 'job_title_name', label: 'المسمى', sortable: true },
    { key: 'academic_degree', label: 'الدرجة', sortable: true },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (e) => (
        <Badge variant={e.status === 'active' ? 'success' : 'danger'}>
          {e.status === 'active' ? 'نشط' : 'غير نشط'}
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
        title="الموظفين"
        description="إدارة بيانات الموظفين والأكاديميين"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة موظف
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن موظف..."
            actions={(item) => (
              <div className="flex items-center gap-1">
                <Link href={`/employees/${item.id}/certificates`}>
                  <Button variant="outline" size="sm" title="الشهادات">
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/employees/${item.id}/assignments`}>
                  <Button variant="outline" size="sm" title="التوزيع">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف موظف', message: 'هل أنت متأكد من حذف هذا الموظف؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            emptyMessage="لا توجد بيانات موظفين بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الموظف' : 'إضافة موظف جديد'}
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
            <label className="block text-sm font-medium mb-1">كود الموظف</label>
            <Input
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
              placeholder="أدخل كود الموظف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="أدخل اسم الموظف..."
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
          <div>
            <label className="block text-sm font-medium mb-1">الهيكل الإداري</label>
            <Select
              value={String(formData.admin_structure_id)}
              onChange={(e) => setFormData({ ...formData, admin_structure_id: Number(e.target.value) })}
              placeholder="اختر الهيكل"
              options={(structures || []).map((s: AdminStructure) => ({ value: s.id, label: s.name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المسمى الوظيفي</label>
            <Select
              value={String(formData.job_title_id)}
              onChange={(e) => setFormData({ ...formData, job_title_id: Number(e.target.value) })}
              placeholder="اختر المسمى"
              options={(jobTitles || []).map((j: JobTitle) => ({ value: j.id, label: j.title }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الدرجة العلمية</label>
            <Input
              value={formData.academic_degree}
              onChange={(e) => setFormData({ ...formData, academic_degree: e.target.value })}
              placeholder="مثال: دكتوراه، ماجستير..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التخصص</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="أدخل التخصص..."
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
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
