import apiClient from '@/lib/axios'
import type { StudySchedule, ApiResponse } from '@/types'

export const studySchedulesService = {
  async getAll(): Promise<StudySchedule[]> {
    try {
      const res = await apiClient.get<StudySchedule[]>('/study-schedules')
      return res.data
    } catch { return [] }
  },

  async getByCollegeAndSemester(collegeId: number, semesterId: number): Promise<StudySchedule[]> {
    try {
      const res = await apiClient.get<StudySchedule[]>(`/study-schedules?college_id=${collegeId}&academic_semester_id=${semesterId}`)
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<StudySchedule | null> {
    try {
      const res = await apiClient.get<StudySchedule>(`/study-schedules/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-schedules', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/study-schedules/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/study-schedules/${id}`)
    return res.data
  },

  async generate(collegeId: number, semesterId: number): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/study-schedules/generate', {
      college_id: collegeId,
      academic_semester_id: semesterId,
    })
    return res.data
  },
}
