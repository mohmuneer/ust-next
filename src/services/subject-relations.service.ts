import apiClient from '@/lib/axios'
import type { SubjectRelation, ApiResponse } from '@/types'

export const subjectRelationsService = {
  async getAll(): Promise<SubjectRelation[]> {
    try { const res = await apiClient.get<SubjectRelation[]>('/subject-relations'); return res.data } catch { return [] }
  },
  async getBySubject(subjectId: number): Promise<SubjectRelation[]> {
    try { const res = await apiClient.get<SubjectRelation[]>(`/subject-relations?study_subject_id=${subjectId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/subject-relations', data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/subject-relations/${id}`); return res.data
  },
}
