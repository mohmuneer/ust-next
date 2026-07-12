'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services/notifications.service'
import { notificationTemplatesService } from '@/services/notification-templates.service'
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
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    recipient_type: 'all',
    recipient_id: 0,
    recipient_email: '',
    recipient_phone: '',
    channel: 'email',
    template_id: 0,
  })

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
  })

  const { data: templates } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationTemplatesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => notificationsService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => notificationsService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: Notification) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        body: item.body,
        recipient_type: item.recipient_type,
        recipient_id: item.recipient_id || 0,
        recipient_email: item.recipient_email || '',
        recipient_phone: item.recipient_phone || '',
        channel: item.channel,
        template_id: item.template_id || 0,
      })
    } else {
      setEditingItem(null)
      setFormData({ title: '', body: '', recipient_type: 'all', recipient_id: 0, recipient_email: '', recipient_phone: '', channel: 'email', template_id: 0 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ title: '', body: '', recipient_type: 'all', recipient_id: 0, recipient_email: '', recipient_phone: '', channel: 'email', template_id: 0 })
  }

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.body.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<Notification>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'title', label: 'العنوان', sortable: true },
    {
      key: 'recipient_type', label: 'نوع المستلم',
      render: (e) => {
        const map: Record<string, string> = { all: 'الكل', student: 'طالب', employee: 'موظف', faculty: 'عضو هيئة تدريس', user: 'مستخدم' }
        return map[e.recipient_type] || e.recipient_type
      },
    },
    { key: 'channel', label: 'القناة' },
    {
      key: 'status', label: 'الحالة',
      render: (e) => {
        const map: Record<string, { label: string; class: string }> = {
          pending: { label: 'قيد الانتظار', class: 'text-yellow-600' },
          sent: { label: 'مرسلة', class: 'text-green-600' },
          failed: { label: 'فشل', class: 'text-red-600' },
        }
        const s = map[e.status] || { label: e.status, class: '' }
        return <span className={s.class}>{s.label}</span>
      },
    },
    {
      key: 'sent_at', label: 'تاريخ الإرسال',
      render: (e) => e.sent_at ? formatDateTime(e.sent_at) : '---',
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      sortable: true,
      render: (e) => formatDateTime(e.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        description="إدارة الإشعارات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إرسال إشعار
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن إشعار..."
            id="notifications-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'الإشعارات')}
            onExportPDF={() => exportToPDF('notifications-table', 'الإشعارات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف إشعار', message: 'هل أنت متأكد من حذف هذا الإشعار؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد إشعارات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الإشعار' : 'إرسال إشعار جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إرسال'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان الإشعار"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">النص *</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="أدخل نص الإشعار"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المستلم</label>
            <Select
              value={formData.recipient_type}
              onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
              options={[
                { value: 'all', label: 'الكل' },
                { value: 'student', label: 'طالب' },
                { value: 'employee', label: 'موظف' },
                { value: 'faculty', label: 'عضو هيئة تدريس' },
                { value: 'user', label: 'مستخدم' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القناة</label>
            <Select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              options={[
                { value: 'email', label: 'بريد إلكتروني' },
                { value: 'sms', label: 'رسالة نصية' },
                { value: 'push', label: 'إشعار فوري' },
                { value: 'all', label: 'جميع القنوات' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القالب</label>
            <SearchableSelect
              value={formData.template_id}
              onChange={(v) => setFormData({ ...formData, template_id: Number(v) })}
              options={[
                { value: 0, label: 'بدون قالب' },
                ...(templates || []).map((s: any) => ({ value: s.id, label: s.template_name })),
              ]}
              searchPlaceholder="بحث عن قالب..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <Input
              value={formData.recipient_email}
              onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
              placeholder="البريد الإلكتروني للمستلم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
            <Input
              value={formData.recipient_phone}
              onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
              placeholder="رقم هاتف المستلم"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
