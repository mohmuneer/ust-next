import apiClient from '@/lib/axios'
import type { ExamSeating, ApiResponse } from '@/types'

export const examSeatingService = {
  async getAll(): Promise<ExamSeating[]> {
    try {
      const res = await apiClient.get<ExamSeating[]>('/exam-seating')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ExamSeating | null> {
    try {
      const res = await apiClient.get<ExamSeating>(`/exam-seating/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/exam-seating', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/exam-seating/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/exam-seating/${id}`)
    return res.data
  },
}
