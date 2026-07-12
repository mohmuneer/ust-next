import apiClient from '@/lib/axios'
import type { College, ApiResponse } from '@/types'

export const collegesService = {
  async getAll(): Promise<College[]> {
    try {
      const res = await apiClient.get<College[]>('/colleges')
      return res.data
    } catch { return [] }
  },

  async getByBranch(branchId: number): Promise<College[]> {
    try {
      const res = await apiClient.get<College[]>(`/colleges?branch_id=${branchId}`)
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<College | null> {
    try {
      const res = await apiClient.get<College>(`/colleges/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { college_name: string; branch_id: number }): Promise<ApiResponse<College>> {
    const res = await apiClient.post<ApiResponse<College>>('/colleges', data)
    return res.data
  },

  async update(id: number, data: { college_name: string; branch_id: number }): Promise<ApiResponse<College>> {
    const res = await apiClient.put<ApiResponse<College>>(`/colleges/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/colleges/${id}`)
    return res.data
  },
}
