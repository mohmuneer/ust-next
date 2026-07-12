'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { universityConfigService } from '@/services/university-config.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { UniversityConfig } from '@/types'

export default function UniversityConfigPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<UniversityConfig | null>(null)
  const [formData, setFormData] = useState({
    config_key: '',
    config_value: '',
    config_group: 'general',
    description: '',
  })

  const { data } = useQuery({
    queryKey: ['university-config'],
    queryFn: () => universityConfigService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => universityConfigService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-config'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => universityConfigService.update(editingConfig!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['university-config'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => universityConfigService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['university-config'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (config?: UniversityConfig) => {
    if (config) {
      setEditingConfig(config)
      setFormData({
        config_key: config.config_key,
        config_value: config.config_value || '',
        config_group: config.config_group,
        description: config.description || '',
      })
    } else {
      setEditingConfig(null)
      setFormData({ config_key: '', config_value: '', config_group: 'general', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingConfig(null)
    setFormData({ config_key: '', config_value: '', config_group: 'general', description: '' })
  }

  const handleSubmit = () => {
    if (!formData.config_key.trim()) return
    if (editingConfig) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<UniversityConfig>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'config_key', label: 'المفتاح', sortable: true },
    { key: 'config_value', label: 'القيمة' },
    { key: 'config_group', label: 'المجموعة' },
    { key: 'description', label: 'الوصف' },
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
        title="إعدادات الجامعة"
        description="إدارة إعدادات الجامعة"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة إعداد
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن إعداد..."
            id="university-config-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'إعدادات الجامعة')}
            onExportPDF={() => exportToPDF('university-config-table', 'إعدادات الجامعة')}
            actions={(config) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(config)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف إعداد', message: 'هل أنت متأكد من حذف هذا الإعداد؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(config.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد إعدادات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingConfig ? 'تعديل الإعداد' : 'إضافة إعداد جديد'}
        size="default"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingConfig ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">المفتاح *</label>
            <Input value={formData.config_key} onChange={(e) => setFormData({ ...formData, config_key: e.target.value })} placeholder="أدخل المفتاح" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القيمة</label>
            <Input value={formData.config_value} onChange={(e) => setFormData({ ...formData, config_value: e.target.value })} placeholder="أدخل القيمة" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المجموعة</label>
            <Select
              value={formData.config_group}
              onChange={(e) => setFormData({ ...formData, config_group: e.target.value })}
              options={[
                { value: 'general', label: 'عام' },
                { value: 'contact', label: 'جهات الاتصال' },
                { value: 'academic', label: 'أكاديمي' },
                { value: 'attendance', label: 'الحضور' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="أدخل الوصف" />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
