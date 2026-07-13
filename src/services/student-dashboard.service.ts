import { studentApi } from './student-api'

export interface DashboardData {
  student: any
  semester: { id: number; semester_name: string; start_date: string; end_date: string } | null
  statistics: {
    total_subjects: number
    total_hours: number
    cumulative_gpa: string | null
    total_earned_hours: number
    semester_gpa: string | null
    attendance_percentage: number
  }
  schedule: any[]
  courses: any[]
  attendance: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
    percentage: number
    records: any[]
  }
  grades: any[]
  fees: {
    items: any[]
    total_paid: number
    total_due: number
  }
  upcomingExams: any[]
  notifications: any[]
  announcements: any[]
  calendar: any[]
}

export const studentDashboardService = {
  async getDashboard(studentId?: number): Promise<DashboardData> {
    const query = studentId ? `?student_id=${studentId}` : ''
    const data = await studentApi.get<any>(`/student-dashboard${query}`)
    return {
      student: data.student || {},
      semester: data.semester || null,
      statistics: data.statistics || { total_subjects: 0, total_hours: 0, cumulative_gpa: null, total_earned_hours: 0, semester_gpa: null, attendance_percentage: 0 },
      schedule: data.schedule || [],
      courses: data.courses || [],
      attendance: data.attendance || { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0, records: [] },
      grades: data.grades || [],
      fees: data.fees || { items: [], total_paid: 0, total_due: 0 },
      upcomingExams: data.upcomingExams || [],
      notifications: data.notifications || [],
      announcements: data.announcements || [],
      calendar: data.calendar || [],
    }
  },
}
