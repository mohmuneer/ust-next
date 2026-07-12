import apiClient from '@/lib/axios'
import type { DocumentCategory, ApiResponse } from '@/types'

export const documentCategoriesService = {
  async getAll(): Promise<DocumentCategory[]> {
    try {
      const res = await apiClient.get<DocumentCategory[]>('/document-categories')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<DocumentCategory | null> {
    try {
      const res = await apiClient.get<DocumentCategory>(`/document-categories/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/document-categories', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/document-categories/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/document-categories/${id}`)
    return res.data
  },
}
