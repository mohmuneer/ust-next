import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface SessionStudent {
  id: number
  full_name: string
  student_number: string
  email: string | null
  phone: string | null
  file_path: string | null
  attendance_status: string | null
  check_in_time: string | null
  check_in_method: string | null
  late_minutes: number | null
}

export const sessionStudentsService = {
  async getBySession(sessionId: number): Promise<SessionStudent[]> {
    try {
      const res = await apiClient.get<SessionStudent[]>(`/session-students/${sessionId}`)
      return res.data
    } catch { return [] }
  },
  async submitManualAttendance(data: { session_id: number; employee_id: number; records: Array<{ student_id: number; status: string; late_minutes?: number; notes?: string }> }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/manual-attendance', data)
    return res.data
  },
}
