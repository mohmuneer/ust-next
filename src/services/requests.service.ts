import apiClient from '@/lib/axios'
import type { Request, CreateRequestPayload, RatingPayload, ApiResponse } from '@/types'

export const requestsService = {
  async getAll(params?: Record<string, unknown>): Promise<Request[]> {
    try {
      const res = await apiClient.get<Request[]>('/requests', { params })
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Request | null> {
    try {
      const res = await apiClient.get<Request>(`/requests/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse<Request>> {
    const res = await apiClient.post<ApiResponse<Request>>('/requests', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse<Request>> {
    const res = await apiClient.put<ApiResponse<Request>>(`/requests/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/requests/${id}`)
    return res.data
  },

  async submitRating(data: RatingPayload): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/tasks/rating', data)
    return res.data
  },
}
