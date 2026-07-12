import apiClient from '@/lib/axios'
import type { UniversityConfig, ApiResponse } from '@/types'

export const universityConfigService = {
  async getAll(): Promise<UniversityConfig[]> {
    try {
      const res = await apiClient.get<UniversityConfig[]>('/university-config')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<UniversityConfig | null> {
    try {
      const res = await apiClient.get<UniversityConfig>(`/university-config/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/university-config', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/university-config/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/university-config/${id}`)
    return res.data
  },
}
