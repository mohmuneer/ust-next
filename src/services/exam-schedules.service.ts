import apiClient from '@/lib/axios'
import type { ExamSchedule, ApiResponse } from '@/types'

export const examSchedulesService = {
  async getAll(): Promise<ExamSchedule[]> {
    try {
      const res = await apiClient.get<ExamSchedule[]>('/exam-schedules')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ExamSchedule | null> {
    try {
      const res = await apiClient.get<ExamSchedule>(`/exam-schedules/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/exam-schedules', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/exam-schedules/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/exam-schedules/${id}`)
    return res.data
  },
}
