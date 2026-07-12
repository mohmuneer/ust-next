import apiClient from '@/lib/axios'
import type { Contractor, ApiResponse } from '@/types'

export const contractorsService = {
  async getAll(): Promise<Contractor[]> {
    try {
      const res = await apiClient.get<Contractor[]>('/contractors')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Contractor | null> {
    try {
      const res = await apiClient.get<Contractor>(`/contractors/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/contractors', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/contractors/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/contractors/${id}`)
    return res.data
  },
}
