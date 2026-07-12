'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '@/services/roles.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Role } from '@/types'

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({ role_name: '', role_code: '' })

  const { data } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => rolesService.create(formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); handleClose() },
  })

  const updateMutation = useMutation({
    mutationFn: () => rolesService.update(editingRole!.id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); handleClose() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (role?: Role) => {
    if (role) { setEditingRole(role); setFormData({ role_name: role.role_name || '', role_code: role.role_code }) }
    else { setEditingRole(null); setFormData({ role_name: '', role_code: '' }) }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false); setEditingRole(null); setFormData({ role_name: '', role_code: '' })
  }

  const handleSubmit = () => {
    if (!formData.role_name.trim() || !formData.role_code.trim()) return
    if (editingRole) updateMutation.mutate(); else createMutation.mutate()
  }

  const columns: Column<any>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'role_name', label: 'اسم الدور', sortable: true },
    { key: 'role_code', label: 'الرمز', sortable: true },
    { key: 'user_count', label: 'عدد المستخدمين' },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الأدوار"
        description="إدارة أدوار المستخدمين"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة دور
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن دور..."
            id="roles-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الأدوار')}
            onExportPDF={() => exportToPDF('roles-table', 'الأدوار')}
            actions={(role) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(role)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button variant="danger" size="sm" onClick={async () => {
                  const ok = await confirm({ title: 'حذف دور', message: 'هل أنت متأكد من حذف هذا الدور؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                  if (ok) deleteMutation.mutate(role.id)
                }}>
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد أدوار بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>{editingRole ? 'حفظ' : 'إضافة'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الدور *</label>
            <Input value={formData.role_name} onChange={(e) => setFormData({ ...formData, role_name: e.target.value })} placeholder="أدخل اسم الدور" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الرمز *</label>
            <Input value={formData.role_code} onChange={(e) => setFormData({ ...formData, role_code: e.target.value })} placeholder="مثال: ADMIN" dir="ltr" className="text-left" />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
