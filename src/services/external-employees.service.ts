import apiClient from '@/lib/axios'
import type { ExternalEmployee, ApiResponse } from '@/types'

export const externalEmployeesService = {
  async getAll(): Promise<ExternalEmployee[]> {
    try {
      const res = await apiClient.get<ExternalEmployee[]>('/external-employees')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ExternalEmployee | null> {
    try {
      const res = await apiClient.get<ExternalEmployee>(`/external-employees/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/external-employees', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/external-employees/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/external-employees/${id}`)
    return res.data
  },
}
