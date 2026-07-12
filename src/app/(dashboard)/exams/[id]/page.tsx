'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examsService, examQuestionsService } from '@/services/exams.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Plus, Pencil, Trash2, ArrowRight, GripVertical } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'
import type { Exam, ExamQuestion } from '@/types'

export default function ExamQuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    sort_order: 0,
  })

  const { data: exam } = useQuery({
    queryKey: ['exam', id],
    queryFn: () => examsService.getById(Number(id)),
  })

  const { data: questions } = useQuery({
    queryKey: ['exam-questions', id],
    queryFn: () => examQuestionsService.getByExamId(Number(id)),
  })

  const deleteMutation = useMutation({
    mutationFn: (qid: number) => examQuestionsService.delete(qid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-questions', id] }),
  })

  const { confirm, modal: confirmModal } = useConfirm()

  const handleOpen = (q?: ExamQuestion) => {
    if (q) {
      setEditingQuestion(q)
      setQuestionForm({
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
        correct_answer: q.correct_answer || '',
        marks: q.marks,
        sort_order: q.sort_order,
      })
    } else {
      setEditingQuestion(null)
      setQuestionForm({ question_text: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', marks: 1, sort_order: (questions?.length || 0) + 1 })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingQuestion(null)
  }

  const totalOtherMarks = (questions || [])
    .filter((q) => q.id !== editingQuestion?.id)
    .reduce((sum, q) => sum + q.marks, 0)
  const remainingMarks = (exam?.total_marks || 0) - totalOtherMarks
  const markError = questionForm.marks > (exam?.total_marks || 0)
    ? `الدرجة لا يمكن أن تتجاوز ${exam?.total_marks}`
    : questionForm.marks > remainingMarks
    ? `المتبقي من الدرجة الكلية هو ${remainingMarks} فقط`
    : ''

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) return
    if (questionForm.marks > (exam?.total_marks || 0)) return
    if (questionForm.marks > remainingMarks) return

    const payload = {
      ...questionForm,
      exam_id: Number(id),
      options: questionForm.question_type === 'multiple_choice' ? questionForm.options.filter((o) => o.trim()) : null,
    }

    if (editingQuestion) {
      await examQuestionsService.update(editingQuestion.id, payload)
    } else {
      await examQuestionsService.save(Number(id), [payload])
    }

    queryClient.invalidateQueries({ queryKey: ['exam-questions', id] })
    handleClose()
  }

  const isPending = false

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam?.title || 'الاختبار'}
        description={`أسئلة الاختبار - ${exam?.subject_name || ''}`}
        actions={
          <Button onClick={() => handleOpen()} size="sm">
            <Plus className="h-4 w-4 ml-1" /> إضافة سؤال
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">المادة</p>
            <p className="font-semibold">{exam?.subject_name || '---'}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">المدة</p>
            <p className="font-semibold">{exam?.duration_minutes} دقيقة</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">الدرجة</p>
            <p className="font-semibold">{exam?.total_marks}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">عدد الأسئلة</p>
            <p className="font-semibold">{questions?.length || 0}</p>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-3">
        {(questions || []).map((q: ExamQuestion, i: number) => (
          <Card key={q.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-2">{q.question_text}</p>
                  {q.question_type === 'multiple_choice' && Array.isArray(q.options) && (
                    <div className="space-y-1 mr-4">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className={`text-sm px-3 py-1 rounded ${opt === q.correct_answer ? 'bg-green-100 dark:bg-green-900/30 text-green-700 font-medium' : 'bg-muted'}`}>
                          {String.fromCharCode(65 + oi)}. {opt} {opt === q.correct_answer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'true_false' && (
                    <div className="mr-4">
                      <span className={`text-sm px-3 py-1 rounded ${q.correct_answer === 'true' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-muted'}`}>
                        {q.correct_answer === 'true' ? 'صواب ✓' : 'خطأ'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>الدرجة: {q.marks}</span>
                    <span>النوع: {q.question_type === 'multiple_choice' ? 'اختيار من متعدد' : q.question_type === 'true_false' ? 'صواب/خطأ' : q.question_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleOpen(q)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={async () => {
                    const ok = await confirm({ title: 'حذف سؤال', message: 'حذف هذا السؤال؟', confirmText: 'حذف', cancelText: 'إلغاء', variant: 'danger', icon: 'delete' })
                    if (ok) deleteMutation.mutate(q.id)
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {(!questions || questions.length === 0) && (
          <Card>
            <CardBody>
              <div className="text-center py-10 text-muted-foreground">
                <p>لا توجد أسئلة لهذا الاختبار</p>
                <Button variant="outline" className="mt-4" onClick={() => handleOpen()}>
                  <Plus className="h-4 w-4 ml-1" /> إضافة أول سؤال
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSaveQuestion} isLoading={isPending}>
              {editingQuestion ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نوع السؤال</label>
            <Select
              value={questionForm.question_type}
              onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
              options={[
                { value: 'multiple_choice', label: 'اختيار من متعدد' },
                { value: 'true_false', label: 'صواب/خطأ' },
                { value: 'short_answer', label: 'إجابة قصيرة' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نص السؤال *</label>
            <textarea
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm min-h-[80px]"
              placeholder="أدخل نص السؤال"
            />
          </div>

          {questionForm.question_type === 'multiple_choice' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">الخيارات (اختر الإجابة الصحيحة)</label>
              {questionForm.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={questionForm.correct_answer === opt}
                    onChange={() => setQuestionForm({ ...questionForm, correct_answer: opt })}
                    className="shrink-0"
                  />
                  <span className="text-sm w-6 shrink-0">{String.fromCharCode(65 + oi)}.</span>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const opts = [...questionForm.options]
                      opts[oi] = e.target.value
                      setQuestionForm({ ...questionForm, options: opts })
                    }}
                    placeholder={`الخيار ${String.fromCharCode(65 + oi)}`}
                  />
                </div>
              ))}
            </div>
          )}

          {questionForm.question_type === 'true_false' && (
            <div>
              <label className="block text-sm font-medium mb-1">الإجابة الصحيحة</label>
              <Select
                value={questionForm.correct_answer}
                onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                options={[
                  { value: 'true', label: 'صواب' },
                  { value: 'false', label: 'خطأ' },
                ]}
              />
            </div>
          )}

          {questionForm.question_type === 'short_answer' && (
            <div>
              <label className="block text-sm font-medium mb-1">الإجابة الصحيحة</label>
              <Input
                value={questionForm.correct_answer}
                onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                placeholder="أدخل الإجابة الصحيحة"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">الدرجة</label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={questionForm.marks}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setQuestionForm({ ...questionForm, marks: v ? Number(v) : 0 })
              }}
              className="w-32"
              maxLength={3}
            />
            {markError && (
              <p className="text-xs text-danger mt-1">{markError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              الدرجة الكلية: {exam?.total_marks || 0} | مجموع الأسئلة الأخرى: {totalOtherMarks} | المتبقي: {remainingMarks}
            </p>
          </div>
        </div>
      </Modal>
      {confirmModal}
    </div>
  )
}
