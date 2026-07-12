import apiClient from '@/lib/axios'
import type { LibraryFine, ApiResponse } from '@/types'

export const libraryFinesService = {
  async getAll(): Promise<LibraryFine[]> {
    try {
      const res = await apiClient.get<LibraryFine[]>('/library-fines')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<LibraryFine | null> {
    try {
      const res = await apiClient.get<LibraryFine>(`/library-fines/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/library-fines', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/library-fines/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/library-fines/${id}`)
    return res.data
  },
}
