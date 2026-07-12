import apiClient from '@/lib/axios'
import type { User, ApiResponse } from '@/types'

export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>('/users')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<User | null> {
    try {
      const res = await apiClient.get<User>(`/users/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>('/users', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse<User>> {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/users/${id}`)
    return res.data
  },
}
