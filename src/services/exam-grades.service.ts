import apiClient from '@/lib/axios'
import type { ExamGrade, ApiResponse } from '@/types'

export const examGradesService = {
  async getAll(): Promise<ExamGrade[]> {
    try {
      const res = await apiClient.get<ExamGrade[]>('/exam-grades')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ExamGrade | null> {
    try {
      const res = await apiClient.get<ExamGrade>(`/exam-grades/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/exam-grades', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/exam-grades/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/exam-grades/${id}`)
    return res.data
  },
}
