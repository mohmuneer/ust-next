import apiClient from '@/lib/axios'
import type { Room, ApiResponse } from '@/types'

export const roomsService = {
  async getAll(): Promise<Room[]> {
    try { const res = await apiClient.get<Room[]>('/rooms'); return res.data } catch { return [] }
  },
  async getByBuilding(buildingId: number): Promise<Room[]> {
    try { const res = await apiClient.get<Room[]>(`/rooms?building_id=${buildingId}`); return res.data } catch { return [] }
  },
  async getByType(roomType: string): Promise<Room[]> {
    try { const res = await apiClient.get<Room[]>(`/rooms?room_type=${roomType}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/rooms', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/rooms/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/rooms/${id}`); return res.data
  },
}
