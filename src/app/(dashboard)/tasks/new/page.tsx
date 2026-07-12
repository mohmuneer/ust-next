'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { tasksService } from '@/services/tasks.service'
import { usersService } from '@/services/users.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, ArrowRight } from 'lucide-react'
import type { Request, User } from '@/types'

export default function NewTaskPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    request_id: 0,
    assigned_to: 0,
    priority: 'Medium',
    deadline: '',
    details: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const createMutation = useMutation({
    mutationFn: () => tasksService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.push('/tasks')
    },
  })

  const supportUsers = (users || []).filter((u: User) => {
    const code = (u.role_code || '').toLowerCase()
    return code === 'support'
  })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.request_id) errs.request_id = 'الرجاء اختيار البلاغ'
    if (!formData.assigned_to) errs.assigned_to = 'الرجاء اختيار الفني'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إضافة مهمة جديدة"
        description="إنشاء مهمة فنية جديدة وإسنادها لأحد الفنيين"
      />

      <div className="max-w-2xl">
        <Card>
          <CardBody className="space-y-6">
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
                  options={supportUsers.map((u: User) => ({ value: u.id, label: u.full_name }))}
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
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="اكتب تفاصيل المهمة وتوجيهات للفني..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
                <Plus className="h-4 w-4 ml-1" /> إضافة المهمة
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowRight className="h-4 w-4 ml-1" /> رجوع
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
