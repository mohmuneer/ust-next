import apiClient from '@/lib/axios'
import type { EmployeeAssignment, ApiResponse } from '@/types'

export const employeeAssignmentsService = {
  async getAll(): Promise<EmployeeAssignment[]> {
    try {
      const res = await apiClient.get<EmployeeAssignment[]>('/employee-assignments')
      return res.data
    } catch { return [] }
  },

  async getByEmployee(employeeId: number): Promise<EmployeeAssignment[]> {
    try {
      const res = await apiClient.get<EmployeeAssignment[]>(`/employee-assignments?employee_id=${employeeId}`)
      return res.data
    } catch { return [] }
  },

  async create(data: {
    employee_id: number
    branch_id?: number | null
    department_id?: number | null
    study_subject_id?: number | null
    study_group_id?: number | null
    study_level_id?: number | null
    academic_semester_id?: number | null
  }): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/employee-assignments', data)
    return res.data
  },

  async update(id: number, data: {
    branch_id?: number | null
    department_id?: number | null
    study_subject_id?: number | null
    study_group_id?: number | null
    study_level_id?: number | null
    academic_semester_id?: number | null
  }): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/employee-assignments/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/employee-assignments/${id}`)
    return res.data
  },
}
