import { studentApi } from './student-api'

export const studentExamsService = {
  getExams(params?: { status?: string }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/exams${q}`)
  },
  getExamSchedules(params?: { student_id?: number }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/exam-schedules${q}`)
  },
  getExamSeating(studentId: number) {
    return studentApi.get<any[]>(`/exam-seating?student_id=${studentId}`)
  },
}
