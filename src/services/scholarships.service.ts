import apiClient from '@/lib/axios'
import type { Scholarship, ApiResponse } from '@/types'

export const scholarshipsService = {
  async getAll(): Promise<Scholarship[]> {
    try {
      const res = await apiClient.get<Scholarship[]>('/scholarships')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Scholarship | null> {
    try {
      const res = await apiClient.get<Scholarship>(`/scholarships/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/scholarships', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/scholarships/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/scholarships/${id}`)
    return res.data
  },
}
