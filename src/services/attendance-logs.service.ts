import apiClient from '@/lib/axios'
import type { AttendanceLog, ApiResponse } from '@/types'

export const attendanceLogsService = {
  async getAll(params?: { session_id?: number; student_id?: number; status?: string; page?: number; per_page?: number }): Promise<{ data: AttendanceLog[]; total: number; page: number; per_page: number }> {
    try {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
      const res = await apiClient.get(`/attendance-logs${q}`)
      return res.data
    } catch { return { data: [], total: 0, page: 1, per_page: 50 } }
  },
}
