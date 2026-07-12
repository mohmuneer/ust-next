import apiClient from '@/lib/axios'
import type { FeeType, ApiResponse } from '@/types'

export const feeTypesService = {
  async getAll(): Promise<FeeType[]> {
    try {
      const res = await apiClient.get<FeeType[]>('/fee-types')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<FeeType | null> {
    try {
      const res = await apiClient.get<FeeType>(`/fee-types/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/fee-types', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/fee-types/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/fee-types/${id}`)
    return res.data
  },
}
