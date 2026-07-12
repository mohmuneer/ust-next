import apiClient from '@/lib/axios'
import type { AttendanceRecord, ApiResponse } from '@/types'

export const attendanceRecordsService = {
  async getAll(): Promise<AttendanceRecord[]> {
    try {
      const res = await apiClient.get<AttendanceRecord[]>('/attendance-records')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AttendanceRecord | null> {
    try {
      const res = await apiClient.get<AttendanceRecord>(`/attendance-records/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/attendance-records', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/attendance-records/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/attendance-records/${id}`)
    return res.data
  },
}
