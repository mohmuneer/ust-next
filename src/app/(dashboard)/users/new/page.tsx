'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { UserPlus } from 'lucide-react'

export default function NewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    status: 1,
    file_path: '',
  })

  const createMutation = useMutation({
    mutationFn: () => usersService.create(form),
    onSuccess: () => {
      router.push('/users')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إضافة مستخدم جديد"
        description="إنشاء حساب مستخدم جديد في النظام"
      />

      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <AvatarUpload
                currentImage={form.file_path}
                onImageChange={(filename) => setForm({ ...form, file_path: filename || '' })}
                size="lg"
                label="الصورة الشخصية"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@ust.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور *</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <Select
                value={String(form.status)}
                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                options={[
                  { value: '1', label: 'نشط' },
                  { value: '0', label: 'غير نشط' },
                ]}
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                <UserPlus className="h-4 w-4 ml-1" /> إضافة المستخدم
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>إلغاء</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
