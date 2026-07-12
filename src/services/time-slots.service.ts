import apiClient from '@/lib/axios'
import type { TimeSlot, ApiResponse } from '@/types'

export const timeSlotsService = {
  async getAll(): Promise<TimeSlot[]> {
    try {
      const res = await apiClient.get<TimeSlot[]>('/time-slots')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<TimeSlot | null> {
    try {
      const res = await apiClient.get<TimeSlot>(`/time-slots/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/time-slots', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/time-slots/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/time-slots/${id}`)
    return res.data
  },
}
