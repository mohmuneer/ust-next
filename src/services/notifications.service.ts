import apiClient from '@/lib/axios'
import type { Notification, ApiResponse } from '@/types'

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    try {
      const res = await apiClient.get<Notification[]>('/notifications')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Notification | null> {
    try {
      const res = await apiClient.get<Notification>(`/notifications/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/notifications', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/notifications/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/notifications/${id}`)
    return res.data
  },
}
