import apiClient from '@/lib/axios'
import type { AcademicRecord, ApiResponse } from '@/types'

export const academicRecordsService = {
  async getAll(): Promise<AcademicRecord[]> {
    try {
      const res = await apiClient.get<AcademicRecord[]>('/academic-records')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AcademicRecord | null> {
    try {
      const res = await apiClient.get<AcademicRecord>(`/academic-records/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/academic-records', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/academic-records/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/academic-records/${id}`)
    return res.data
  },
}
