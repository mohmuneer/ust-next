import apiClient from '@/lib/axios'
import type { Message, ApiResponse } from '@/types'

export const messagesService = {
  async getConversations(): Promise<Message[]> {
    try {
      const res = await apiClient.get<Message[]>('/messages/conversations')
      return res.data
    } catch { return [] }
  },

  async getMessages(userId: number): Promise<Message[]> {
    try {
      const res = await apiClient.get<Message[]>(`/messages/${userId}`)
      return res.data
    } catch { return [] }
  },

  async send(data: { receiver_id: number; message: string }): Promise<ApiResponse<Message>> {
    const res = await apiClient.post<ApiResponse<Message>>('/messages', data)
    return res.data
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>('/messages/unread-count')
      return res.data.count
    } catch { return 0 }
  },
}
