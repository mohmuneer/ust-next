import { studentApi } from './student-api'

export interface StudentScheduleData {
  student: Record<string, any> | null
  subjects: any[]
  schedule: any[]
  semester: { id: number; semester_name: string } | null
  total_hours: number
  total_subjects: number
}

export const studentScheduleService = {
  async getStudentSchedule(studentId: number): Promise<StudentScheduleData> {
    const data = await studentApi.get<any>(`/student-schedule?student_id=${studentId}`)
    return {
      student: data.student || null,
      subjects: data.subjects || [],
      schedule: data.schedule || [],
      semester: data.semester || null,
      total_hours: data.total_hours || 0,
      total_subjects: data.total_subjects || 0,
    }
  },

  getSchedule(params?: { day?: string; study_group_id?: number }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/study-schedules${q}`)
  },

  getLectures(params?: { status?: string }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/lectures${q}`)
  },
}
