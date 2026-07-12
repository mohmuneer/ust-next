import apiClient from '@/lib/axios'
import type { Lecture, ApiResponse } from '@/types'

export const lecturesService = {
  async getBySemester(semesterId: number): Promise<Lecture[]> {
    try { const res = await apiClient.get<Lecture[]>(`/lectures?academic_semester_id=${semesterId}`); return res.data } catch { return [] }
  },
  async getByEmployee(employeeId: number): Promise<Lecture[]> {
    try { const res = await apiClient.get<Lecture[]>(`/lectures?employee_id=${employeeId}`); return res.data } catch { return [] }
  },
  async getBySubject(subjectId: number): Promise<Lecture[]> {
    try { const res = await apiClient.get<Lecture[]>(`/lectures?study_subject_id=${subjectId}`); return res.data } catch { return [] }
  },
  async getByRoom(roomId: number): Promise<Lecture[]> {
    try { const res = await apiClient.get<Lecture[]>(`/lectures?room_id=${roomId}`); return res.data } catch { return [] }
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/lectures', data); return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/lectures/${id}`, data); return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/lectures/${id}`); return res.data
  },
}
