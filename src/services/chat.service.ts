import apiClient from '@/lib/axios'
import type { ChatMessage, Conversation, ChatGroup, GroupMember, UserPresence, SendMessageParams } from '@/types/chat'

export const chatService = {
  async getConversations(userId: number): Promise<Conversation[]> {
    try {
      const res = await apiClient.get<Conversation[]>(`/messages/conversations?user_id=${userId}`)
      return res.data
    } catch { return [] }
  },

  async getMessages(userId: number, page = 1, limit = 50): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/messages/${userId}?page=${page}&limit=${limit}`)
      return res.data
    } catch { return [] }
  },

  async getGroupMessages(groupId: number, page = 1, limit = 50): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/messages/group/${groupId}?page=${page}&limit=${limit}`)
      return res.data
    } catch { return [] }
  },

  async sendMessage(data: SendMessageParams): Promise<ChatMessage | null> {
    const res = await apiClient.post<{ success: boolean; data: ChatMessage; error?: string }>('/messages', data, { timeout: 60000 })
    if (!res.data.success) throw new Error(res.data.error || 'Failed to send')
    return res.data.data
  },

  async markAsRead(userId: number, readerId: number): Promise<void> {
    try {
      await apiClient.put(`/messages/${userId}/read`, { reader_id: readerId })
    } catch { /* ignore */ }
  },

  async markGroupAsRead(groupId: number, userId: number): Promise<void> {
    try {
      await apiClient.put(`/messages/group/${groupId}/read`, { user_id: userId })
    } catch { /* ignore */ }
  },

  async getUnreadCount(userId: number): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>(`/messages/unread-count?user_id=${userId}`)
      return res.data.count
    } catch { return 0 }
  },

  async searchUsers(query: string, userId: number): Promise<unknown[]> {
    try {
      const res = await apiClient.get<unknown[]>(`/messages/users/search?q=${encodeURIComponent(query)}&user_id=${userId}`)
      return res.data
    } catch { return [] }
  },

  async searchMessages(query: string, userId: number): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/messages/search?q=${encodeURIComponent(query)}&user_id=${userId}`)
      return res.data
    } catch { return [] }
  },

  async getGroups(userId: number): Promise<ChatGroup[]> {
    try {
      const res = await apiClient.get<ChatGroup[]>(`/messages/groups?user_id=${userId}`)
      return res.data
    } catch { return [] }
  },

  async createGroup(data: { name: string; description?: string; member_ids: number[]; created_by: number }): Promise<ChatGroup | null> {
    try {
      const res = await apiClient.post<{ success: boolean; data: ChatGroup }>('/messages/groups', data)
      return res.data.data
    } catch { return null }
  },

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    try {
      const res = await apiClient.get<GroupMember[]>(`/messages/groups/${groupId}/members`)
      return res.data
    } catch { return [] }
  },

  async updatePresence(userId: number, isOnline: boolean): Promise<void> {
    try {
      await apiClient.put('/messages/presence', { user_id: userId, is_online: isOnline })
    } catch { /* ignore */ }
  },

  async getPresence(userId: number): Promise<UserPresence | null> {
    try {
      const res = await apiClient.get<UserPresence>(`/messages/presence/${userId}`)
      return res.data
    } catch { return null }
  },

  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/messages/${messageId}`)
      return true
    } catch { return false }
  },

  async editMessage(messageId: number, text: string): Promise<ChatMessage | null> {
    try {
      const res = await apiClient.put<{ data: ChatMessage }>(`/messages/${messageId}`, { message_text: text, is_edited: true })
      return res.data.data
    } catch { return null }
  },

  async pinMessage(messageId: number, isPinned: boolean): Promise<boolean> {
    try {
      await apiClient.put(`/messages/${messageId}`, { is_pinned: isPinned })
      return true
    } catch { return false }
  },

  async starMessage(messageId: number, isStarred: boolean): Promise<boolean> {
    try {
      await apiClient.put(`/messages/${messageId}`, { is_starred: isStarred })
      return true
    } catch { return false }
  },
}
