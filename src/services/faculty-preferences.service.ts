import apiClient from '@/lib/axios'
import type { FacultyPreference, ApiResponse } from '@/types'

export const facultyPreferencesService = {
  async getAll(): Promise<FacultyPreference[]> {
    try { const res = await apiClient.get<FacultyPreference[]>('/faculty-preferences'); return res.data } catch { return [] }
  },
  async getByEmployee(employeeId: number): Promise<FacultyPreference | null> {
    try {
      const res = await apiClient.get<FacultyPreference[]>(`/faculty-preferences?employee_id=${employeeId}`)
      return res.data[0] || null
    } catch { return null }
  },
  async upsert(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/faculty-preferences', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/faculty-preferences/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/faculty-preferences/${id}`); return res.data
  },
}
