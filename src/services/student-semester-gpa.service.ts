import apiClient from '@/lib/axios'
import type { StudentSemesterGpa, ApiResponse } from '@/types'

export const studentSemesterGpaService = {
  async getAll(): Promise<StudentSemesterGpa[]> {
    try {
      const res = await apiClient.get<StudentSemesterGpa[]>('/student-semester-gpa')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<StudentSemesterGpa | null> {
    try {
      const res = await apiClient.get<StudentSemesterGpa>(`/student-semester-gpa/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/student-semester-gpa', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/student-semester-gpa/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/student-semester-gpa/${id}`)
    return res.data
  },
}
