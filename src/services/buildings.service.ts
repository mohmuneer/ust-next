import apiClient from '@/lib/axios'
import type { Building, ApiResponse } from '@/types'

export const buildingsService = {
  async getAll(): Promise<Building[]> {
    try { const res = await apiClient.get<Building[]>('/buildings'); return res.data } catch { return [] }
  },
  async getByCollege(collegeId: number): Promise<Building[]> {
    try { const res = await apiClient.get<Building[]>(`/buildings?college_id=${collegeId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/buildings', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/buildings/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/buildings/${id}`); return res.data
  },
}
