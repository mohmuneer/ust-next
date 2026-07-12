import apiClient from '@/lib/axios'
import type { Department, ApiResponse } from '@/types'

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    try {
      const res = await apiClient.get<Department[]>('/departments')
      return res.data
    } catch { return [] }
  },

  async getByCollege(collegeId: number): Promise<Department[]> {
    try {
      const res = await apiClient.get<Department[]>(`/departments?college_id=${collegeId}`)
      return res.data
    } catch { return [] }
  },

  async create(data: { department_name: string; college_id: number }): Promise<ApiResponse<Department>> {
    const res = await apiClient.post<ApiResponse<Department>>('/departments', data)
    return res.data
  },

  async update(id: number, data: { department_name: string; college_id: number }): Promise<ApiResponse<Department>> {
    const res = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/departments/${id}`)
    return res.data
  },
}
