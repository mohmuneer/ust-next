import apiClient from '@/lib/axios'
import type { Student, ApiResponse } from '@/types'

export const studentsService = {
  async getAll(): Promise<Student[]> {
    try {
      const res = await apiClient.get<Student[]>('/students')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/students', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/students/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/students/${id}`)
    return res.data
  },
}
