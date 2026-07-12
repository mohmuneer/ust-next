import apiClient from '@/lib/axios'
import type { LibraryBorrowing, ApiResponse } from '@/types'

export const libraryBorrowingsService = {
  async getAll(): Promise<LibraryBorrowing[]> {
    try {
      const res = await apiClient.get<LibraryBorrowing[]>('/library-borrowings')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<LibraryBorrowing | null> {
    try {
      const res = await apiClient.get<LibraryBorrowing>(`/library-borrowings/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/library-borrowings', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/library-borrowings/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/library-borrowings/${id}`)
    return res.data
  },
}
