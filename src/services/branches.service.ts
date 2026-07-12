import apiClient from '@/lib/axios'
import type { Branch, ApiResponse } from '@/types'

export const branchesService = {
  async getAll(): Promise<Branch[]> {
    try {
      const res = await apiClient.get<Branch[]>('/branches')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Branch | null> {
    try {
      const res = await apiClient.get<Branch>(`/branches/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { branch_name: string }): Promise<ApiResponse<Branch>> {
    const res = await apiClient.post<ApiResponse<Branch>>('/branches', data)
    return res.data
  },

  async update(id: number, data: { branch_name: string }): Promise<ApiResponse<Branch>> {
    const res = await apiClient.put<ApiResponse<Branch>>(`/branches/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/branches/${id}`)
    return res.data
  },
}
