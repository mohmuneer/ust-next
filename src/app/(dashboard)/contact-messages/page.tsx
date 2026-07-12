'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactMessagesService } from '@/services/contact-messages.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Trash2, Mail, MailOpen } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { ContactMessage } from '@/types'

export default function ContactMessagesPage() {
  const queryClient = useQueryClient()
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null)

  const { data } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: () => contactMessagesService.getAll(),
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => contactMessagesService.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-messages'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactMessagesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-messages'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleView = (msg: ContactMessage) => {
    setViewingMessage(msg)
    setIsViewOpen(true)
    if (!msg.is_read) {
      markAsReadMutation.mutate(msg.id)
    }
  }

  const handleCloseView = () => {
    setIsViewOpen(false)
    setViewingMessage(null)
  }

  const columns: Column<ContactMessage>[] = [
    {
      key: 'is_read', label: '',
      render: (e) => e.is_read
        ? <MailOpen className="h-4 w-4 text-gray-400" />
        : <Mail className="h-4 w-4 text-blue-600" />,
    },
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'subject', label: 'الموضوع' },
    {
      key: 'message', label: 'الرسالة',
      render: (e) => e.message.length > 50 ? e.message.slice(0, 50) + '...' : e.message,
    },
    {
      key: 'is_read', label: 'الحالة',
      render: (e) => (
        <span className={e.is_read ? 'text-green-600' : 'text-blue-600'}>
          {e.is_read ? 'مقروء' : 'جديد'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإرسال',
      sortable: true,
      render: (e) => formatDateTime(e.created_at!),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="رسائل التواصل"
        description="إدارة رسائل التواصل من الزوار"
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن رسالة..."
            id="contact-messages-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'رسائل التواصل')}
            onExportPDF={() => exportToPDF('contact-messages-table', 'رسائل التواصل')}
            actions={(msg) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleView(msg)}>
                  <Mail className="h-4 w-4 ml-1" /> عرض
                </Button>
                {!msg.is_read && (
                  <Button variant="outline" size="sm" onClick={() => markAsReadMutation.mutate(msg.id)}>
                    <MailOpen className="h-4 w-4 ml-1" /> تحديد كمقروء
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف رسالة', message: 'هل أنت متأكد من حذف هذه الرسالة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(msg.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد رسائل بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isViewOpen}
        onClose={handleCloseView}
        title="عرض الرسالة"
        size="default"
        footer={
          <Button variant="outline" onClick={handleCloseView}>إغلاق</Button>
        }
      >
        {viewingMessage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <p className="text-sm">{viewingMessage.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <p className="text-sm">{viewingMessage.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الهاتف</label>
              <p className="text-sm">{viewingMessage.phone || '---'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الموضوع</label>
              <p className="text-sm">{viewingMessage.subject || '---'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الرسالة</label>
              <p className="text-sm whitespace-pre-wrap">{viewingMessage.message}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الإرسال</label>
              <p className="text-sm">{formatDateTime(viewingMessage.created_at!)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <p className="text-sm">{viewingMessage.is_read ? 'مقروء' : 'جديد'}</p>
            </div>
          </div>
        )}
      </Modal>
      {confirmModal}
    </div>
  )
}
