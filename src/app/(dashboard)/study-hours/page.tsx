'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/modal'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Pencil, Save } from 'lucide-react'
import { studySubjectsService } from '@/services/study-subjects.service'
import { collegesService } from '@/services/colleges.service'
import type { StudySubject } from '@/types'

const HOUR_OPTIONS = [
  { value: 1, label: '1 ساعة' },
  { value: 2, label: '2 ساعة' },
  { value: 3, label: '3 ساعة' },
  { value: 4, label: '4 ساعة' },
  { value: 5, label: '5 ساعة' },
  { value: 6, label: '6 ساعة' },
]

export default function StudyHoursPage() {
  const queryClient = useQueryClient()
  const [selectedCollege, setSelectedCollege] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<StudySubject | null>(null)
  const [editHours, setEditHours] = useState<string>('')

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getAll(),
  })

  const { data: allSubjects = [] } = useQuery({
    queryKey: ['study-subjects'],
    queryFn: () => studySubjectsService.getAll(),
  })

  const subjects = selectedCollege > 0
    ? allSubjects.filter(s => s.college_id === selectedCollege)
    : allSubjects

  const updateMutation = useMutation({
    mutationFn: ({ id, weekly_hours }: { id: number; weekly_hours: number | null }) =>
      studySubjectsService.update(id, {
        subject_name: allSubjects.find(s => s.id === id)?.subject_name || '',
        subject_code: allSubjects.find(s => s.id === id)?.subject_code || null,
        college_id: allSubjects.find(s => s.id === id)?.college_id || null,
        department_id: allSubjects.find(s => s.id === id)?.department_id || null,
        study_level_id: allSubjects.find(s => s.id === id)?.study_level_id || null,
        study_group_id: allSubjects.find(s => s.id === id)?.study_group_id || null,
        academic_semester_id: allSubjects.find(s => s.id === id)?.academic_semester_id || null,
        weekly_hours,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
      handleClose()
    },
  })

  function openEdit(subject: StudySubject) {
    setEditingSubject(subject)
    setEditHours(subject.weekly_hours?.toString() || '')
    setShowModal(true)
  }

  function handleClose() {
    setShowModal(false)
    setEditingSubject(null)
    setEditHours('')
  }

  function handleSave() {
    if (!editingSubject) return
    const val = editHours === '' ? null : parseFloat(editHours)
    if (val !== null && (isNaN(val) || val < 0.5 || val > 99)) return
    updateMutation.mutate({ id: editingSubject.id, weekly_hours: val })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سياسة الدوام</h1>
          <p className="text-sm text-muted-foreground mt-1">تحديد عدد الساعات الأسبوعية لكل مادة</p>
        </div>
      </div>

      <div className="w-64">
        <SearchableSelect
          label="الكلية"
          value={selectedCollege}
          onChange={(v) => setSelectedCollege(Number(v))}
          placeholder="كل المواد..."
          options={(colleges || []).map(c => ({ value: c.id, label: c.college_name }))}
        />
      </div>

      <DataTable
        columns={[
          { key: 'subject_name', label: 'المادة' },
          { key: 'subject_code', label: 'الكود' },
          {
            key: 'weekly_hours',
            label: 'الساعات الأسبوعية',
            render: (row: StudySubject) => (
              <span className="text-sm tabular-nums">
                {row.weekly_hours ? `${row.weekly_hours} س` : '—'}
              </span>
            ),
          },
          { key: 'college_name', label: 'الكلية' },
          { key: 'department_name', label: 'القسم' },
          { key: 'level_name', label: 'المستوى' },
          { key: 'group_name', label: 'المجموعة' },
        ]}
        data={subjects}
        searchable
        searchPlaceholder="بحث..."
        actions={(row: StudySubject) => (
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={`تعديل ساعات المادة: ${editingSubject?.subject_name || ''}`}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">الساعات الأسبوعية</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
            >
              <option value="">-- بدون —</option>
              {HOUR_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {editingSubject && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <div><span className="text-muted-foreground">المادة: </span>{editingSubject.subject_name}</div>
              {editingSubject.college_name && (
                <div><span className="text-muted-foreground">الكلية: </span>{editingSubject.college_name}</div>
              )}
              {editingSubject.department_name && (
                <div><span className="text-muted-foreground">القسم: </span>{editingSubject.department_name}</div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={updateMutation.isPending}>
              <Save className="ml-2 h-4 w-4" />
              حفظ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
