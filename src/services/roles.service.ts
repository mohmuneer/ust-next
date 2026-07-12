import apiClient from '@/lib/axios'
import type { Role, ApiResponse } from '@/types'
import type { PagePermissionsMap } from '@/lib/page-permissions'

export const rolesService = {
  async getAll(): Promise<Role[]> {
    try {
      const res = await apiClient.get<Role[]>('/roles')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/roles', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/roles/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/roles/${id}`)
    return res.data
  },
}

export const userPermissionsService = {
  async getAll(): Promise<any[]> {
    try {
      const res = await apiClient.get('/user-permissions')
      return res.data
    } catch { return [] }
  },

  async getUserRoles(userId: number): Promise<any[]> {
    try {
      const res = await apiClient.get(`/user-permissions/${userId}`)
      return res.data
    } catch { return [] }
  },

  async assign(userId: number, roleIds: number[]): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/user-permissions', { user_id: userId, role_ids: roleIds })
    return res.data
  },
}

export const permissionsService = {
  async getAll(): Promise<any[]> {
    try {
      const res = await apiClient.get('/permissions')
      return res.data
    } catch { return [] }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/permissions', data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/permissions/${id}`)
    return res.data
  },
}

export const rolePagePermissionsService = {
  async getByRole(roleId: number): Promise<PagePermissionsMap> {
    try {
      const res = await apiClient.get<PagePermissionsMap>(`/role-page-permissions/${roleId}/bulk`)
      return res.data
    } catch { return {} }
  },

  async save(roleId: number, permissions: PagePermissionsMap): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>(`/role-page-permissions/${roleId}/bulk`, { permissions })
    return res.data
  },

  async getByUser(userId: number): Promise<PagePermissionsMap> {
    try {
      const res = await apiClient.get<PagePermissionsMap>(`/role-page-permissions/user/${userId}`)
      return res.data
    } catch { return {} }
  },

  async getByEmployee(employeeId: number): Promise<PagePermissionsMap> {
    try {
      const res = await apiClient.get<PagePermissionsMap>(`/role-page-permissions/employee/${employeeId}`)
      return res.data
    } catch { return {} }
  },
}

export const employeePermissionsService = {
  async getAll(): Promise<any[]> {
    try {
      const res = await apiClient.get('/employee-permissions')
      return res.data
    } catch { return [] }
  },

  async getEmployeeRoles(employeeId: number): Promise<any[]> {
    try {
      const res = await apiClient.get(`/employee-permissions/${employeeId}`)
      return res.data
    } catch { return [] }
  },

  async assign(employeeId: number, roleIds: number[]): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/employee-permissions', { employee_id: employeeId, role_ids: roleIds })
    return res.data
  },
}
