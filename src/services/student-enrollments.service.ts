import apiClient from '@/lib/axios'
import type { StudentEnrollment, ApiResponse } from '@/types'

export const studentEnrollmentsService = {
  async getAll(): Promise<StudentEnrollment[]> {
    try {
      const res = await apiClient.get<StudentEnrollment[]>('/student-enrollments')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<StudentEnrollment | null> {
    try {
      const res = await apiClient.get<StudentEnrollment>(`/student-enrollments/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/student-enrollments', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/student-enrollments/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/student-enrollments/${id}`)
    return res.data
  },
}
