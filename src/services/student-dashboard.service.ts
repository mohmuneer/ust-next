import { studentApi } from './student-api'

export interface StudentDashboardData {
  student: any
  enrollments: any[]
  schedule: any[]
  upcomingExams: any[]
  notifications: any[]
  fees: any[]
  attendance: {
    total: number
    present: number
    absent: number
    late: number
    percentage: number
  }
  semesterGpa: any
}

export const studentDashboardService = {
  async getDashboard(): Promise<StudentDashboardData> {
    const data = await studentApi.get<any>('/student-dashboard')
    return {
      student: data.student || {},
      enrollments: data.enrollments || [],
      schedule: data.schedule || [],
      upcomingExams: data.upcoming_exams || [],
      notifications: data.notifications || [],
      fees: data.fees || [],
      attendance: data.attendance || { total: 0, present: 0, absent: 0, late: 0, percentage: 0 },
      semesterGpa: data.semester_gpa || null,
    }
  },
}
