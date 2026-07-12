import apiClient from '@/lib/axios'
import type { StudyLevel, ApiResponse } from '@/types'

export const studyLevelsService = {
  async getAll(): Promise<StudyLevel[]> {
    try {
      const res = await apiClient.get<StudyLevel[]>('/study-levels')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-levels', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/study-levels/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/study-levels/${id}`)
    return res.data
  },
}
