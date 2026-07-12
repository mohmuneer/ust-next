import apiClient from '@/lib/axios'
import type { JobOpening, ApiResponse } from '@/types'

export const jobOpeningsService = {
  async getAll(): Promise<JobOpening[]> {
    try {
      const res = await apiClient.get<JobOpening[]>('/job-openings')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<JobOpening | null> {
    try {
      const res = await apiClient.get<JobOpening>(`/job-openings/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/job-openings', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/job-openings/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/job-openings/${id}`)
    return res.data
  },
}
