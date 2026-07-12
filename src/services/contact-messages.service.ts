import apiClient from '@/lib/axios'
import type { ContactMessage, ApiResponse } from '@/types'

export const contactMessagesService = {
  async getAll(): Promise<ContactMessage[]> {
    try {
      const res = await apiClient.get<ContactMessage[]>('/contact-messages')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ContactMessage | null> {
    try {
      const res = await apiClient.get<ContactMessage>(`/contact-messages/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/contact-messages', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/contact-messages/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/contact-messages/${id}`)
    return res.data
  },
}
