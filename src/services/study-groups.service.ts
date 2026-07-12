import apiClient from '@/lib/axios'
import type { StudyGroup, ApiResponse } from '@/types'

export const studyGroupsService = {
  async getAll(): Promise<StudyGroup[]> {
    try {
      const res = await apiClient.get<StudyGroup[]>('/study-groups')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<StudyGroup | null> {
    try {
      const res = await apiClient.get<StudyGroup>(`/study-groups/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-groups', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/study-groups/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/study-groups/${id}`)
    return res.data
  },
}
