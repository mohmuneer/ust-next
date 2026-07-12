import apiClient from '@/lib/axios'
import type { UniversityNews, ApiResponse } from '@/types'

export const universityNewsService = {
  async getAll(): Promise<UniversityNews[]> {
    try {
      const res = await apiClient.get<UniversityNews[]>('/university-news')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<UniversityNews | null> {
    try {
      const res = await apiClient.get<UniversityNews>(`/university-news/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/university-news', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/university-news/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/university-news/${id}`)
    return res.data
  },
}
