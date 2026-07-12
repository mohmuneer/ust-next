import apiClient from '@/lib/axios'
import type { AcademicSemester, ApiResponse } from '@/types'

export const academicSemestersService = {
  async getAll(): Promise<AcademicSemester[]> {
    try {
      const res = await apiClient.get<AcademicSemester[]>('/academic-semesters')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/academic-semesters', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/academic-semesters/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/academic-semesters/${id}`)
    return res.data
  },
}
