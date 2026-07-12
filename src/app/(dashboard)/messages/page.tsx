'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesService } from '@/services/messages.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Send, MessageSquare } from 'lucide-react'
import { formatDateTime, getImageUrl } from '@/lib/utils'
import type { Message } from '@/types'

export default function MessagesPage() {
  const queryClient = useQueryClient()
  const [isSendModal, setIsSendModal] = useState(false)
  const [formData, setFormData] = useState({ receiver_id: 0, message: '' })

  const { data } = useQuery({
    queryKey: ['messages'],
    queryFn: () => messagesService.getConversations(),
  })

  const sendMutation = useMutation({
    mutationFn: () => messagesService.send(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      setIsSendModal(false)
      setFormData({ receiver_id: 0, message: '' })
    },
  })

  const columns: Column<Message>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'file_path',
      label: 'المستخدم',
      render: (m) => (
        <div className="flex items-center gap-2">
          <img
            src={getImageUrl(m.file_path)}
            alt={m.full_name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span>{m.full_name}</span>
        </div>
      ),
    },
    {
      key: 'message_text',
      label: 'آخر رسالة',
      render: (m) => (
        <span className="truncate max-w-[200px] inline-block">
          {m.message_text}
        </span>
      ),
    },
    {
      key: 'is_read',
      label: 'الحالة',
      render: (m) => (
        <span className={m.is_read ? 'text-muted-foreground' : 'font-bold text-foreground'}>
          {m.is_read ? 'مقروءة' : 'جديدة'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'التاريخ',
      sortable: true,
      render: (m) => formatDateTime(m.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="الرسائل"
        description="إدارة الرسائل والمحادثات"
        actions={
          <Button onClick={() => setIsSendModal(true)} size="sm">
            <Send className="h-4 w-4 ml-1" /> إرسال رسالة
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث في الرسائل..."
            emptyMessage="لا توجد رسائل بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isSendModal}
        onClose={() => setIsSendModal(false)}
        title="إرسال رسالة جديدة"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSendModal(false)}>إلغاء</Button>
            <Button onClick={() => sendMutation.mutate()} isLoading={sendMutation.isPending}>
              <Send className="h-4 w-4 ml-1" /> إرسال
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المستلم (معرف المستخدم)</label>
            <Input
              type="number"
              value={formData.receiver_id || ''}
              onChange={(e) => setFormData({ ...formData, receiver_id: Number(e.target.value) })}
              placeholder="أدخل معرف المستخدم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نص الرسالة</label>
            <textarea
              className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="اكتب رسالتك هنا..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
