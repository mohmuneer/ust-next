import apiClient from '@/lib/axios'
import type { Guardian, ApiResponse } from '@/types'

export const guardiansService = {
  async getAll(): Promise<Guardian[]> {
    try {
      const res = await apiClient.get<Guardian[]>('/guardians')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/guardians', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/guardians/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/guardians/${id}`)
    return res.data
  },
}
