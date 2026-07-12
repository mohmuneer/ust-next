import apiClient from '@/lib/axios'
import type { Employee, ApiResponse } from '@/types'

export const employeesService = {
  async getAll(): Promise<Employee[]> {
    try {
      const res = await apiClient.get<Employee[]>('/employees')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Employee | null> {
    try {
      const res = await apiClient.get<Employee>(`/employees/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: {
    employee_code?: string
    full_name: string
    email?: string | null
    phone?: string | null
    password?: string | null
    admin_structure_id?: number | null
    job_title_id?: number | null
    academic_degree?: string | null
    specialization?: string | null
    status?: string
  }): Promise<ApiResponse<Employee>> {
    const res = await apiClient.post<ApiResponse<Employee>>('/employees', data)
    return res.data
  },

  async update(id: number, data: {
    employee_code?: string
    full_name?: string
    email?: string | null
    phone?: string | null
    password?: string | null
    admin_structure_id?: number | null
    job_title_id?: number | null
    academic_degree?: string | null
    specialization?: string | null
    status?: string
  }): Promise<ApiResponse<Employee>> {
    const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/employees/${id}`)
    return res.data
  },
}
