import apiClient from '@/lib/axios'
import type { Document, ApiResponse } from '@/types'

export const documentsService = {
  async getAll(): Promise<Document[]> {
    try {
      const res = await apiClient.get<Document[]>('/documents')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Document | null> {
    try {
      const res = await apiClient.get<Document>(`/documents/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/documents', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/documents/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/documents/${id}`)
    return res.data
  },
}
