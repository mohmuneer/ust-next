import apiClient from '@/lib/axios'
import type { AttendanceSession, ApiResponse } from '@/types'

export const attendanceSessionsService = {
  async getAll(): Promise<AttendanceSession[]> {
    try {
      const res = await apiClient.get<AttendanceSession[]>('/attendance-sessions')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AttendanceSession | null> {
    try {
      const res = await apiClient.get<AttendanceSession>(`/attendance-sessions/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/attendance-sessions', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/attendance-sessions/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/attendance-sessions/${id}`)
    return res.data
  },
}
