import apiClient from '@/lib/axios'
import type { NotificationTemplate, ApiResponse } from '@/types'

export const notificationTemplatesService = {
  async getAll(): Promise<NotificationTemplate[]> {
    try {
      const res = await apiClient.get<NotificationTemplate[]>('/notification-templates')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<NotificationTemplate | null> {
    try {
      const res = await apiClient.get<NotificationTemplate>(`/notification-templates/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/notification-templates', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/notification-templates/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/notification-templates/${id}`)
    return res.data
  },
}
