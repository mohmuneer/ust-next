'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesService } from '@/services/employees.service'
import { employeeCertificatesService } from '@/services/employee-certificates.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, ArrowRight, Upload, FileDown } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Employee, EmployeeCertificate } from '@/types'

export default function EmployeeCertificatesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EmployeeCertificate | null>(null)
  const [formData, setFormData] = useState({
    certificate_name: '',
    issuing_authority: '',
    year: '',
    file_path: '',
  })
  const [uploading, setUploading] = useState(false)

  const { data: employee } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesService.getById(Number(id)),
  })

  const { data: certificates } = useQuery({
    queryKey: ['employee-certificates', id],
    queryFn: () => employeeCertificatesService.getByEmployee(Number(id)),
  })

  const createMutation = useMutation({
    mutationFn: () => employeeCertificatesService.create({
      employee_id: Number(id),
      certificate_name: formData.certificate_name,
      issuing_authority: formData.issuing_authority || null,
      year: formData.year || null,
      file_path: formData.file_path || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-certificates', id] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => employeeCertificatesService.update(editingItem!.id, {
      certificate_name: formData.certificate_name,
      issuing_authority: formData.issuing_authority || null,
      year: formData.year || null,
      file_path: formData.file_path || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-certificates', id] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (cid: number) => employeeCertificatesService.delete(cid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee-certificates', id] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (cert?: EmployeeCertificate) => {
    if (cert) {
      setEditingItem(cert)
      setFormData({
        certificate_name: cert.certificate_name,
        issuing_authority: cert.issuing_authority || '',
        year: cert.year || '',
        file_path: cert.file_path || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ certificate_name: '', issuing_authority: '', year: '', file_path: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ certificate_name: '', issuing_authority: '', year: '', file_path: '' })
  }

  const handleSubmit = () => {
    if (!formData.certificate_name.trim()) return
    if (editingItem) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await employeeCertificatesService.uploadFile(file)
      if (result.success && result.file_path) {
        setFormData({ ...formData, file_path: result.file_path })
      }
    } catch {
      // ignore
    }
    setUploading(false)
  }

  const columns: Column<EmployeeCertificate>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'certificate_name', label: 'اسم الشهادة', sortable: true },
    { key: 'issuing_authority', label: 'الجهة المانحة', sortable: true },
    { key: 'year', label: 'السنة', sortable: true },
    {
      key: 'file_path',
      label: 'الملف',
      render: (c) => c.file_path ? (
        <a
          href={`http://localhost:8080/ustproject/uploads/${c.file_path}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <FileDown className="h-4 w-4" /> عرض
        </a>
      ) : '---',
    },
    {
      key: 'created_at',
      label: 'تاريخ الإضافة',
      sortable: true,
      render: (c) => formatDateTime(c.created_at!),
    },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title={`شهادات - ${employee?.full_name || ''}`}
        description="السجل الأكاديمي والشهادات"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowRight className="h-4 w-4 ml-1" /> رجوع
            </Button>
            <Button onClick={() => handleOpen()} size="sm">
              <Plus className="h-4 w-4 ml-1" /> إضافة شهادة
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={certificates || []}
            searchable
            searchPlaceholder="بحث عن شهادة..."
            actions={(cert) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(cert)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف شهادة', message: 'هل أنت متأكد من حذف هذه الشهادة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(cert.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد شهادات لهذا الموظف"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {editingItem ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم الشهادة *</label>
            <Input
              value={formData.certificate_name}
              onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
              placeholder="أدخل اسم الشهادة..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الجهة المانحة</label>
            <Input
              value={formData.issuing_authority}
              onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
              placeholder="اسم الجهة التي أصدرت الشهادة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">سنة الحصول</label>
            <Input
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="مثال: 2020"
              className="w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملف الشهادة</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 ml-1" />
                {uploading ? 'جاري الرفع...' : 'اختيار ملف'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
              {formData.file_path && (
                <span className="text-xs text-muted-foreground">
                  تم رفع الملف
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, JPG, PNG - الحد الأقصى 5MB
            </p>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
