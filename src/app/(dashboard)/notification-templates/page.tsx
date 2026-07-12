'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationTemplatesService } from '@/services/notification-templates.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { NotificationTemplate } from '@/types'

export default function NotificationTemplatesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NotificationTemplate | null>(null)
  const [formData, setFormData] = useState({
    template_name: '',
    template_key: '',
    subject: '',
    body: '',
    channels: '',
    variables: '',
  })

  const { data } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationTemplatesService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => notificationTemplatesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => notificationTemplatesService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationTemplatesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-templates'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: NotificationTemplate) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        template_name: item.template_name,
        template_key: item.template_key || '',
        subject: item.subject || '',
        body: item.body,
        channels: item.channels,
        variables: item.variables || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ template_name: '', template_key: '', subject: '', body: '', channels: '', variables: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ template_name: '', template_key: '', subject: '', body: '', channels: '', variables: '' })
  }

  const handleSubmit = () => {
    if (!formData.template_name.trim() || !formData.body.trim()) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<NotificationTemplate>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'template_name', label: 'اسم القالب', sortable: true },
    { key: 'template_key', label: 'المفتاح' },
    { key: 'subject', label: 'الموضوع' },
    { key: 'channels', label: 'القنوات' },
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
        title="قوالب الإشعارات"
        description="إدارة قوالب الإشعارات"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة قالب
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن قالب..."
            id="notification-templates-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'قوالب الإشعارات')}
            onExportPDF={() => exportToPDF('notification-templates-table', 'قوالب الإشعارات')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف قالب', message: 'هل أنت متأكد من حذف هذا القالب؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد قوالب بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل القالب' : 'إضافة قالب جديد'}
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
            <label className="block text-sm font-medium mb-1">اسم القالب *</label>
            <Input
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              placeholder="أدخل اسم القالب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المفتاح</label>
            <Input
              value={formData.template_key}
              onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
              placeholder="مفتاح القالب"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الموضوع</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="موضوع الإشعار"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">النص *</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              rows={6}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="أدخل نص القالب"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القنوات</label>
            <Input
              value={formData.channels}
              onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
              placeholder="email, sms, push"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المتغيرات</label>
            <Input
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              placeholder="{name}, {email}"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
