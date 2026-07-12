'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { rolesService } from '@/services/roles.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldPlus } from 'lucide-react'

export default function NewRolePage() {
  const router = useRouter()
  const [form, setForm] = useState({ role_name: '', role_code: '' })

  const createMutation = useMutation({
    mutationFn: () => rolesService.create(form),
    onSuccess: () => router.push('/roles'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.role_name.trim() || !form.role_code.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="إضافة دور جديد" description="إنشاء دور مستخدم جديد" />

      <Card className="max-w-xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الدور *</label>
              <Input value={form.role_name} onChange={(e) => setForm({ ...form, role_name: e.target.value })} placeholder="أدخل اسم الدور" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الرمز *</label>
              <Input value={form.role_code} onChange={(e) => setForm({ ...form, role_code: e.target.value })} placeholder="مثال: ADMIN" dir="ltr" className="text-left" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" isLoading={createMutation.isPending}>
                <ShieldPlus className="h-4 w-4 ml-1" /> إضافة الدور
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>إلغاء</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
