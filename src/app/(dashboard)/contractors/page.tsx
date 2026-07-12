'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractorsService } from '@/services/contractors.service'
import { collegesService } from '@/services/colleges.service'
import { departmentsService } from '@/services/departments.service'
import { employeesService } from '@/services/employees.service'
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
import type { Contractor } from '@/types'

export default function ContractorsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    full_name_en: '',
    identity_number: '',
    phone: '',
    email: '',
    address: '',
    contract_type: 'monthly',
    contract_number: '',
    start_date: '',
    end_date: '',
    salary_amount: 0,
    allowances: 0,
    bank_account: '',
    bank_name: '',
    college_id: 0,
    department_id: 0,
    supervisor_id: 0,
    status: 'active',
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => contractorsService.getAll(),
  })

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.getAll(),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => contractorsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => contractorsService.update(editingContractor!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractorsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractors'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (contractor?: Contractor) => {
    if (contractor) {
      setEditingContractor(contractor)
      setFormData({
        full_name: contractor.full_name,
        full_name_en: contractor.full_name_en || '',
        identity_number: contractor.identity_number || '',
        phone: contractor.phone || '',
        email: contractor.email || '',
        address: contractor.address || '',
        contract_type: contractor.contract_type,
        contract_number: contractor.contract_number || '',
        start_date: contractor.start_date ? contractor.start_date.slice(0, 10) : '',
        end_date: contractor.end_date ? contractor.end_date.slice(0, 10) : '',
        salary_amount: contractor.salary_amount,
        allowances: contractor.allowances,
        bank_account: contractor.bank_account || '',
        bank_name: contractor.bank_name || '',
        college_id: contractor.college_id || 0,
        department_id: contractor.department_id || 0,
        supervisor_id: contractor.supervisor_id || 0,
        status: contractor.status,
        notes: contractor.notes || '',
      })
    } else {
      setEditingContractor(null)
      setFormData({
        full_name: '', full_name_en: '', identity_number: '', phone: '', email: '',
        address: '', contract_type: 'monthly', contract_number: '', start_date: '',
        end_date: '', salary_amount: 0, allowances: 0, bank_account: '', bank_name: '',
        college_id: 0, department_id: 0, supervisor_id: 0, status: 'active', notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingContractor(null)
    setFormData({
      full_name: '', full_name_en: '', identity_number: '', phone: '', email: '',
      address: '', contract_type: 'monthly', contract_number: '', start_date: '',
      end_date: '', salary_amount: 0, allowances: 0, bank_account: '', bank_name: '',
      college_id: 0, department_id: 0, supervisor_id: 0, status: 'active', notes: '',
    })
  }

  const handleSubmit = () => {
    if (!formData.full_name.trim()) return
    if (editingContractor) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Contractor>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'identity_number', label: 'رقم الهوية' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'email', label: 'البريد' },
    { key: 'contract_type', label: 'نوع العقد' },
    { key: 'contract_number', label: 'رقم العقد' },
    {
      key: 'start_date', label: 'تاريخ البداية',
      render: (e) => e.start_date ? e.start_date.slice(0, 10) : '---',
    },
    {
      key: 'end_date', label: 'تاريخ النهاية',
      render: (e) => e.end_date ? e.end_date.slice(0, 10) : '---',
    },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          active: { label: 'نشط', class: 'text-green-600' },
          suspended: { label: 'موقوف', class: 'text-yellow-600' },
          terminated: { label: 'منتهي', class: 'text-red-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
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
        title="المتعاقدون"
        description="إدارة بيانات المتعاقدين"
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
            id="contractors-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'المتعاقدون')}
            onExportPDF={() => exportToPDF('contractors-table', 'المتعاقدون')}
            actions={(contractor) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(contractor)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف متعاقد', message: 'هل أنت متأكد من حذف هذا المتعاقد؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(contractor.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا يوجد متعاقدون بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingContractor ? 'تعديل بيانات المتعاقد' : 'إضافة متعاقد جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingContractor ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم *</label>
            <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="أدخل الاسم" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم (إنجليزي)</label>
            <Input value={formData.full_name_en} onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })} placeholder="English name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهوية</label>
            <Input value={formData.identity_number} onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الهاتف</label>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع العقد</label>
            <Select
              value={formData.contract_type}
              onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
              options={[
                { value: 'monthly', label: 'شهري' },
                { value: 'yearly', label: 'سنوي' },
                { value: 'project', label: 'مشروع' },
                { value: 'daily', label: 'يومي' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم العقد</label>
            <Input value={formData.contract_number} onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
            <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
            <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الراتب</label>
            <Input type="number" value={formData.salary_amount} onChange={(e) => setFormData({ ...formData, salary_amount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البدلات</label>
            <Input type="number" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البنك</label>
            <Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الحساب البنكي</label>
            <Input value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الكلية</label>
            <SearchableSelect
              value={formData.college_id}
              onChange={(v) => setFormData({ ...formData, college_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون كلية' },
                ...(colleges || []).map((c: any) => ({ value: c.id, label: c.college_name })),
              ]}
              searchPlaceholder="بحث عن كلية..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم</label>
            <SearchableSelect
              value={formData.department_id}
              onChange={(v) => setFormData({ ...formData, department_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون قسم' },
                ...(departments || []).map((d: any) => ({ value: d.id, label: d.department_name })),
              ]}
              searchPlaceholder="بحث عن قسم..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المشرف</label>
            <SearchableSelect
              value={formData.supervisor_id}
              onChange={(v) => setFormData({ ...formData, supervisor_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون مشرف' },
                ...(employees || []).map((e: any) => ({ value: e.id, label: e.full_name })),
              ]}
              searchPlaceholder="بحث عن موظف..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'suspended', label: 'موقوف' },
                { value: 'terminated', label: 'منتهي' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
