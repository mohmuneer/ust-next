import { studentApi } from './student-api'
import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types'

export const studentFeesService = {
  // Student-facing
  getFees(studentId: number) {
    return studentApi.get<any[]>(`/student-fees?student_id=${studentId}`)
  },
  getPayments(studentId: number) {
    return studentApi.get<any[]>(`/fee-payments`)
  },
  // Admin CRUD
  async getAll(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/student-fees')
    return res.data
  },
  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/student-fees', data)
    return res.data
  },
  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/student-fees/${id}`, data)
    return res.data
  },
  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/student-fees/${id}`)
    return res.data
  },
}
