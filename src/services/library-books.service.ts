import apiClient from '@/lib/axios'
import type { LibraryBook, ApiResponse } from '@/types'

export const libraryBooksService = {
  async getAll(): Promise<LibraryBook[]> {
    try {
      const res = await apiClient.get<LibraryBook[]>('/library-books')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<LibraryBook | null> {
    try {
      const res = await apiClient.get<LibraryBook>(`/library-books/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/library-books', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/library-books/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/library-books/${id}`)
    return res.data
  },
}
