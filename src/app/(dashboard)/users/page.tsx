'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, getImageUrl } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import type { User } from '@/types'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { confirm, modal: confirmModal } = useConfirm()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editData, setEditData] = useState({ full_name: '', email: '', status: 1, password: '', file_path: '' })

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const updateMutation = useMutation({
    mutationFn: (id: number) => usersService.update(id, editData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditData({ full_name: user.full_name, email: user.email, status: user.status, password: '', file_path: user.file_path || '' })
    setIsEditOpen(true)
  }

  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: 'حذف مستخدم',
      message: `هل أنت متأكد من حذف المستخدم "${user.full_name}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      variant: 'danger',
      icon: 'delete',
    })
    if (ok) deleteMutation.mutate(user.id)
  }

  const handleSaveEdit = () => {
    if (editingUser) updateMutation.mutate(editingUser.id)
  }

  const columns: Column<User>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'file_path',
      label: 'الصورة',
      render: (u) => (
        <img
          src={getImageUrl(u.file_path)}
          alt={u.full_name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ),
    },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد الإلكتروني', sortable: true },
    { key: 'role_names', label: 'الأدوار' },
    {
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (u) => (
        <Badge variant={u.status === 1 ? 'success' : 'danger'}>
          {u.status === 1 ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ التسجيل',
      sortable: true,
      render: (u) => formatDateTime(u.created_at!),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="المستخدمون"
        description="إدارة مستخدمي النظام"
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مستخدم..."
            actions={(user) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(user)}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مستخدمين بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="تعديل بيانات المستخدم"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveEdit} isLoading={updateMutation.isPending}>حفظ التغييرات</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex justify-center">
            <AvatarUpload
              currentImage={editData.file_path}
              onImageChange={(filename) => setEditData({ ...editData, file_path: filename || '' })}
              size="lg"
              label="الصورة الشخصية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
            <Input
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <Input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور (اترك فارغاً إن لم ترد التغيير)</label>
            <Input
              type="password"
              value={editData.password}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              placeholder="أدخل كلمة المرور الجديدة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <Select
              value={String(editData.status)}
              onChange={(e) => setEditData({ ...editData, status: Number(e.target.value) })}
              options={[
                { value: 1, label: 'نشط' },
                { value: 0, label: 'غير نشط' },
              ]}
            />
          </div>
        </div>
      </Modal>

      {confirmModal}
    </div>
  )
}
