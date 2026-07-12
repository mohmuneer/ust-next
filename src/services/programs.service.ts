import apiClient from '@/lib/axios'
import type { Program, ApiResponse } from '@/types'

export const programsService = {
  async getAll(): Promise<Program[]> {
    try { const res = await apiClient.get<Program[]>('/programs'); return res.data } catch { return [] }
  },
  async getByDepartment(deptId: number): Promise<Program[]> {
    try { const res = await apiClient.get<Program[]>(`/programs?department_id=${deptId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/programs', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/programs/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/programs/${id}`); return res.data
  },
}
