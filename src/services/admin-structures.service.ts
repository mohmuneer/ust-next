import apiClient from '@/lib/axios'
import type { AdminStructure, ApiResponse } from '@/types'

export const adminStructuresService = {
  async getAll(): Promise<AdminStructure[]> {
    try {
      const res = await apiClient.get<AdminStructure[]>('/admin-structures')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<AdminStructure | null> {
    try {
      const res = await apiClient.get<AdminStructure>(`/admin-structures/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { name: string; parent_id?: number | null; sort_order?: number }): Promise<ApiResponse<AdminStructure>> {
    const res = await apiClient.post<ApiResponse<AdminStructure>>('/admin-structures', data)
    return res.data
  },

  async update(id: number, data: { name: string; parent_id?: number | null; sort_order?: number }): Promise<ApiResponse<AdminStructure>> {
    const res = await apiClient.put<ApiResponse<AdminStructure>>(`/admin-structures/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/admin-structures/${id}`)
    return res.data
  },
}
