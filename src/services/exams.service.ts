import apiClient from '@/lib/axios'
import type { Exam, ApiResponse } from '@/types'

export const examsService = {
  async getAll(): Promise<Exam[]> {
    try {
      const res = await apiClient.get<Exam[]>('/exams')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Exam | null> {
    try {
      const res = await apiClient.get<Exam>(`/exams/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/exams', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/exams/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/exams/${id}`)
    return res.data
  },
}

export const examQuestionsService = {
  async getByExamId(examId: number): Promise<any[]> {
    try {
      const res = await apiClient.get(`/exam-questions/${examId}`)
      return res.data
    } catch { return [] }
  },

  async save(examId: number, questions: any[]): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/exam-questions', { exam_id: examId, questions })
    return res.data
  },

  async update(id: number, data: any): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/exam-questions/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/exam-questions/${id}`)
    return res.data
  },
}
