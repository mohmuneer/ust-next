import apiClient from '@/lib/axios'
import type { StudyPlan, ApiResponse } from '@/types'

export const studyPlansService = {
  async getAll(): Promise<StudyPlan[]> {
    try { const res = await apiClient.get<StudyPlan[]>('/study-plans'); return res.data } catch { return [] }
  },
  async getByProgram(programId: number): Promise<StudyPlan[]> {
    try { const res = await apiClient.get<StudyPlan[]>(`/study-plans?program_id=${programId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-plans', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/study-plans/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/study-plans/${id}`); return res.data
  },
}
