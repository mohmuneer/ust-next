import apiClient from '@/lib/axios'

export interface AttendanceReportSummary {
  total_sessions: number
  total_records: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_rate: number
}

export interface SubjectReport {
  subject_name: string
  subject_id: number
  session_count: number
  present_count: number
  absent_count: number
  late_count: number
  excused_count: number
  total_records: number
}

export interface EmployeeReport {
  employee_name: string
  employee_id: number
  session_count: number
  present_count: number
  absent_count: number
  late_count: number
  total_records: number
}

export interface DailyTrend {
  date: string
  session_count: number
  present_count: number
  absent_count: number
  late_count: number
}

export interface MethodBreakdown {
  method: string | null
  count: number
}

export interface StudentAttendanceRate {
  id: number
  full_name: string
  student_number: string
  total: number
  attended: number
  rate: number
}

export interface AttendanceReportData {
  summary: AttendanceReportSummary
  by_subject: SubjectReport[]
  by_employee: EmployeeReport[]
  daily_trend: DailyTrend[]
  by_method: MethodBreakdown[]
  top_students: StudentAttendanceRate[]
  worst_students: StudentAttendanceRate[]
}

export const attendanceReportsService = {
  async getReport(params?: {
    date_from?: string
    date_to?: string
    subject_id?: number
    employee_id?: number
  }): Promise<AttendanceReportData> {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.subject_id) query.set('subject_id', String(params.subject_id))
    if (params?.employee_id) query.set('employee_id', String(params.employee_id))

    const qs = query.toString()
    const res = await apiClient.get<AttendanceReportData>(`/attendance-reports${qs ? '?' + qs : ''}`)
    return res.data
  },
}
