import apiClient from '@/lib/axios'
import type { LibraryReservation, ApiResponse } from '@/types'

export const libraryReservationsService = {
  async getAll(): Promise<LibraryReservation[]> {
    try {
      const res = await apiClient.get<LibraryReservation[]>('/library-reservations')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<LibraryReservation | null> {
    try {
      const res = await apiClient.get<LibraryReservation>(`/library-reservations/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/library-reservations', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/library-reservations/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/library-reservations/${id}`)
    return res.data
  },
}
