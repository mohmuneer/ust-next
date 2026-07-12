'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractorDocumentsService } from '@/services/contractor-documents.service'
import { contractorsService } from '@/services/contractors.service'
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
import type { ContractorDocument } from '@/types'

export default function ContractorDocumentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<ContractorDocument | null>(null)
  const [formData, setFormData] = useState({
    contractor_id: 0,
    document_type: 'contract',
    document_name: '',
    file_path: '',
    issue_date: '',
    expiry_date: '',
    is_verified: true,
    notes: '',
  })

  const { data } = useQuery({
    queryKey: ['contractor-documents'],
    queryFn: () => contractorDocumentsService.getAll(),
  })

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: () => contractorsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => contractorDocumentsService.create(formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-documents'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => contractorDocumentsService.update(editingDocument!.id, formData as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractor-documents'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contractorDocumentsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractor-documents'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (doc?: ContractorDocument) => {
    if (doc) {
      setEditingDocument(doc)
      setFormData({
        contractor_id: doc.contractor_id,
        document_type: doc.document_type,
        document_name: doc.document_name || '',
        file_path: doc.file_path || '',
        issue_date: doc.issue_date ? doc.issue_date.slice(0, 10) : '',
        expiry_date: doc.expiry_date ? doc.expiry_date.slice(0, 10) : '',
        is_verified: doc.is_verified,
        notes: doc.notes || '',
      })
    } else {
      setEditingDocument(null)
      setFormData({ contractor_id: 0, document_type: 'contract', document_name: '', file_path: '', issue_date: '', expiry_date: '', is_verified: true, notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingDocument(null)
    setFormData({ contractor_id: 0, document_type: 'contract', document_name: '', file_path: '', issue_date: '', expiry_date: '', is_verified: true, notes: '' })
  }

  const handleSubmit = () => {
    if (!formData.contractor_id) return
    if (editingDocument) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<ContractorDocument>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'contractor_name', label: 'المتعاقد' },
    { key: 'document_type', label: 'نوع المستند' },
    { key: 'document_name', label: 'اسم المستند' },
    {
      key: 'issue_date', label: 'تاريخ الإصدار',
      render: (e) => e.issue_date ? e.issue_date.slice(0, 10) : '---',
    },
    {
      key: 'expiry_date', label: 'تاريخ الانتهاء',
      render: (e) => e.expiry_date ? e.expiry_date.slice(0, 10) : '---',
    },
    {
      key: 'is_verified', label: 'موثق',
      render: (e) => (
        <span className={e.is_verified ? 'text-green-600' : 'text-red-600'}>
          {e.is_verified ? 'موثق' : 'غير موثق'}
        </span>
      ),
    },
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
        title="مستندات المتعاقدين"
        description="إدارة مستندات المتعاقدين"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مستند
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مستند..."
            id="contractor-documents-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'مستندات المتعاقدين')}
            onExportPDF={() => exportToPDF('contractor-documents-table', 'مستندات المتعاقدين')}
            actions={(doc) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(doc)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مستند', message: 'هل أنت متأكد من حذف هذا المستند؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(doc.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مستندات بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingDocument ? 'تعديل المستند' : 'إضافة مستند جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingDocument ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">المتعاقد *</label>
            <SearchableSelect
              value={formData.contractor_id}
              onChange={(v) => setFormData({ ...formData, contractor_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر متعاقد' },
                ...(contractors || []).map((c: any) => ({ value: c.id, label: c.full_name })),
              ]}
              searchPlaceholder="بحث عن متعاقد..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المستند</label>
            <Select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              options={[
                { value: 'contract', label: 'عقد' },
                { value: 'id_card', label: 'بطاقة هوية' },
                { value: 'passport', label: 'جواز سفر' },
                { value: 'certificate', label: 'شهادة' },
                { value: 'license', label: 'رخصة' },
                { value: 'other', label: 'أخرى' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم المستند</label>
            <Input value={formData.document_name} onChange={(e) => setFormData({ ...formData, document_name: e.target.value })} placeholder="أدخل اسم المستند" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">مسار الملف</label>
            <Input value={formData.file_path} onChange={(e) => setFormData({ ...formData, file_path: e.target.value })} placeholder="رابط الملف" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الإصدار</label>
            <Input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
            <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">موثق</label>
            <Select
              value={formData.is_verified ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, is_verified: e.target.value === '1' })}
              options={[
                { value: '1', label: 'موثق' },
                { value: '0', label: 'غير موثق' },
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
