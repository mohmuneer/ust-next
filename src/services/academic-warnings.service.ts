import apiClient from '@/lib/axios'
import type { AcademicWarning, ApiResponse } from '@/types'

export const academicWarningsService = {
  async getAll(): Promise<AcademicWarning[]> {
    try {
      const res = await apiClient.get<AcademicWarning[]>('/academic-warnings')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AcademicWarning | null> {
    try {
      const res = await apiClient.get<AcademicWarning>(`/academic-warnings/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/academic-warnings', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/academic-warnings/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/academic-warnings/${id}`)
    return res.data
  },
}
