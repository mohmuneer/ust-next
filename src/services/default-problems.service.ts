import apiClient from '@/lib/axios'
import type { DefaultProblem, ApiResponse } from '@/types'

export const defaultProblemsService = {
  async getAll(): Promise<DefaultProblem[]> {
    try {
      const res = await apiClient.get<DefaultProblem[]>('/default-problems')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<DefaultProblem | null> {
    try {
      const res = await apiClient.get<DefaultProblem>(`/default-problems/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { problem_name: string; group_id: number }): Promise<ApiResponse<DefaultProblem>> {
    const res = await apiClient.post<ApiResponse<DefaultProblem>>('/default-problems', data)
    return res.data
  },

  async update(id: number, data: { problem_name: string; group_id: number }): Promise<ApiResponse<DefaultProblem>> {
    const res = await apiClient.put<ApiResponse<DefaultProblem>>(`/default-problems/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/default-problems/${id}`)
    return res.data
  },
}
