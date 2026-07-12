import apiClient from '@/lib/axios'
import type { AcademicCalendarEvent, ApiResponse } from '@/types'

export const academicCalendarService = {
  async getAll(): Promise<AcademicCalendarEvent[]> {
    try {
      const res = await apiClient.get<AcademicCalendarEvent[]>('/academic-calendar')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AcademicCalendarEvent | null> {
    try {
      const res = await apiClient.get<AcademicCalendarEvent>(`/academic-calendar/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/academic-calendar', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/academic-calendar/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/academic-calendar/${id}`)
    return res.data
  },
}
