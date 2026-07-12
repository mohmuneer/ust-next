import apiClient from '@/lib/axios'
import type { EmployeeCertificate, ApiResponse } from '@/types'

export const employeeCertificatesService = {
  async getByEmployee(employeeId: number): Promise<EmployeeCertificate[]> {
    try {
      const res = await apiClient.get<EmployeeCertificate[]>(`/employee-certificates?employee_id=${employeeId}`)
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<EmployeeCertificate | null> {
    try {
      const res = await apiClient.get<EmployeeCertificate>(`/employee-certificates/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: {
    employee_id: number
    certificate_name: string
    issuing_authority?: string | null
    year?: string | null
    file_path?: string | null
  }): Promise<ApiResponse<EmployeeCertificate>> {
    const res = await apiClient.post<ApiResponse<EmployeeCertificate>>('/employee-certificates', data)
    return res.data
  },

  async update(id: number, data: {
    certificate_name?: string
    issuing_authority?: string | null
    year?: string | null
    file_path?: string | null
  }): Promise<ApiResponse<EmployeeCertificate>> {
    const res = await apiClient.put<ApiResponse<EmployeeCertificate>>(`/employee-certificates/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/employee-certificates/${id}`)
    return res.data
  },

  async uploadFile(file: File): Promise<{ success: boolean; file_path?: string; error?: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('http://localhost:8080/ustproject/api/index.php?path=upload-file', {
      method: 'POST',
      body: formData,
    })
    return res.json()
  },
}
