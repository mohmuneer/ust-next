'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseSyllabiService } from '@/services/course-syllabi.service'
import { studySubjectsService } from '@/services/study-subjects.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { CourseSyllabus } from '@/types'

export default function CourseSyllabiPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CourseSyllabus | null>(null)
  const [formData, setFormData] = useState({
    study_subject_id: 0,
    objectives: '',
    learning_outcomes: '',
    teaching_methods: '',
    assessment_methods: '',
    references: '',
  })

  const { data } = useQuery({
    queryKey: ['course-syllabi'],
    queryFn: () => courseSyllabiService.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: () => courseSyllabiService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-syllabi'] })
      handleClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => courseSyllabiService.update(editingItem!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-syllabi'] })
      handleClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseSyllabiService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course-syllabi'] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (item?: CourseSyllabus) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        study_subject_id: item.study_subject_id || 0,
        objectives: item.objectives || '',
        learning_outcomes: item.learning_outcomes || '',
        teaching_methods: item.teaching_methods || '',
        assessment_methods: item.assessment_methods || '',
        references: item.references || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ study_subject_id: 0, objectives: '', learning_outcomes: '', teaching_methods: '', assessment_methods: '', references: '' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ study_subject_id: 0, objectives: '', learning_outcomes: '', teaching_methods: '', assessment_methods: '', references: '' })
  }

  const handleSubmit = () => {
    if (!formData.study_subject_id) return
    if (editingItem) updateMutation.mutate()
    else createMutation.mutate()
  }

  const columns: Column<CourseSyllabus>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'subject_name', label: 'المادة', sortable: true },
    { key: 'subject_code', label: 'رمز المادة' },
    { key: 'objectives', label: 'الأهداف', render: (e) => e.objectives ? e.objectives.slice(0, 60) + '...' : '---' },
    { key: 'learning_outcomes', label: 'مخرجات التعلم', render: (e) => e.learning_outcomes ? e.learning_outcomes.slice(0, 60) + '...' : '---' },
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
        title="مفردات المادة"
        description="إدارة مفردات المواد الدراسية"
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة مفردات
          </Button>
        }
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث عن مفردات..."
            id="course-syllabi-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'مفردات المادة')}
            onExportPDF={() => exportToPDF('course-syllabi-table', 'مفردات المادة')}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpen(item)}>
                  <Pencil className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({ title: 'حذف مفردات', message: 'هل أنت متأكد من حذف مفردات المادة؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(item.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            )}
            emptyMessage="لا توجد مفردات مواد بعد"
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'تعديل مفردات المادة' : 'إضافة مفردات مادة جديدة'}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">المادة *</label>
            <SearchableSelect
              value={formData.study_subject_id}
              onChange={(v) => setFormData({ ...formData, study_subject_id: Number(v) })}
              options={[
                { value: 0, label: 'اختر مادة...' },
                ...(subjects || []).map((s: any) => ({ value: s.id, label: s.subject_name })),
              ]}
              searchPlaceholder="بحث عن مادة..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الأهداف</label>
            <Input
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="أدخل أهداف المادة"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">مخرجات التعلم</label>
            <Input
              value={formData.learning_outcomes}
              onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
              placeholder="أدخل مخرجات التعلم"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">طرق التدريس</label>
            <Input
              value={formData.teaching_methods}
              onChange={(e) => setFormData({ ...formData, teaching_methods: e.target.value })}
              placeholder="أدخل طرق التدريس"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">طرق التقييم</label>
            <Input
              value={formData.assessment_methods}
              onChange={(e) => setFormData({ ...formData, assessment_methods: e.target.value })}
              placeholder="أدخل طرق التقييم"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">المراجع</label>
            <Input
              value={formData.references}
              onChange={(e) => setFormData({ ...formData, references: e.target.value })}
              placeholder="أدخل المراجع"
            />
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
