import apiClient from '@/lib/axios'
import type { Lab, ApiResponse } from '@/types'

export const labsService = {
  async getAll(): Promise<Lab[]> {
    try {
      const res = await apiClient.get<Lab[]>('/labs')
      return res.data
    } catch { return [] }
  },

  async getByCollege(collegeId: number): Promise<Lab[]> {
    try {
      const res = await apiClient.get<Lab[]>(`/labs?college_id=${collegeId}`)
      return res.data
    } catch { return [] }
  },

  async create(data: { lab_name: string; college_id: number }): Promise<ApiResponse<Lab>> {
    const res = await apiClient.post<ApiResponse<Lab>>('/labs', data)
    return res.data
  },

  async update(id: number, data: { lab_name: string; college_id: number }): Promise<ApiResponse<Lab>> {
    const res = await apiClient.put<ApiResponse<Lab>>(`/labs/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/labs/${id}`)
    return res.data
  },
}
