import apiClient from '@/lib/axios'
import type { PlanSubject, ApiResponse } from '@/types'

export const planSubjectsService = {
  async getByPlan(planId: number): Promise<PlanSubject[]> {
    try { const res = await apiClient.get<PlanSubject[]>(`/plan-subjects?study_plan_id=${planId}`); return res.data } catch { return [] }
  },
  async getByLevel(levelId: number): Promise<PlanSubject[]> {
    try { const res = await apiClient.get<PlanSubject[]>(`/plan-subjects?study_level_id=${levelId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/plan-subjects', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/plan-subjects/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/plan-subjects/${id}`); return res.data
  },
}
