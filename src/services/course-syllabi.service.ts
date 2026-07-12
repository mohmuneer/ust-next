import apiClient from '@/lib/axios'
import type { CourseSyllabus, ApiResponse } from '@/types'

export const courseSyllabiService = {
  async getAll(): Promise<CourseSyllabus[]> {
    try {
      const res = await apiClient.get<CourseSyllabus[]>('/course-syllabi')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<CourseSyllabus | null> {
    try {
      const res = await apiClient.get<CourseSyllabus>(`/course-syllabi/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/course-syllabi', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/course-syllabi/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/course-syllabi/${id}`)
    return res.data
  },
}
