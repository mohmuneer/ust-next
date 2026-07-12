import apiClient from '@/lib/axios'
import type { UniversityEvent, ApiResponse } from '@/types'

export const universityEventsService = {
  async getAll(): Promise<UniversityEvent[]> {
    try {
      const res = await apiClient.get<UniversityEvent[]>('/university-events')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<UniversityEvent | null> {
    try {
      const res = await apiClient.get<UniversityEvent>(`/university-events/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/university-events', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/university-events/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/university-events/${id}`)
    return res.data
  },
}
