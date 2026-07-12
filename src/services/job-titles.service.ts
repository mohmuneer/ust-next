import apiClient from '@/lib/axios'
import type { JobTitle, ApiResponse } from '@/types'

export const jobTitlesService = {
  async getAll(): Promise<JobTitle[]> {
    try {
      const res = await apiClient.get<JobTitle[]>('/job-titles')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<JobTitle | null> {
    try {
      const res = await apiClient.get<JobTitle>(`/job-titles/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { title: string }): Promise<ApiResponse<JobTitle>> {
    const res = await apiClient.post<ApiResponse<JobTitle>>('/job-titles', data)
    return res.data
  },

  async update(id: number, data: { title: string }): Promise<ApiResponse<JobTitle>> {
    const res = await apiClient.put<ApiResponse<JobTitle>>(`/job-titles/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/job-titles/${id}`)
    return res.data
  },
}
