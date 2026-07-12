import apiClient from '@/lib/axios'
import type { StudySubject, ApiResponse } from '@/types'

export const studySubjectsService = {
  async getAll(): Promise<StudySubject[]> {
    try {
      const res = await apiClient.get<StudySubject[]>('/study-subjects')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<StudySubject | null> {
    try {
      const res = await apiClient.get<StudySubject>(`/study-subjects/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-subjects', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/study-subjects/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/study-subjects/${id}`)
    return res.data
  },
}
