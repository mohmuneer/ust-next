import apiClient from '@/lib/axios'
import type { ProblemGroup, ApiResponse } from '@/types'

export const problemGroupsService = {
  async getAll(): Promise<ProblemGroup[]> {
    try {
      const res = await apiClient.get<ProblemGroup[]>('/groups')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ProblemGroup | null> {
    try {
      const res = await apiClient.get<ProblemGroup>(`/groups/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: { group_name: string }): Promise<ApiResponse<ProblemGroup>> {
    const res = await apiClient.post<ApiResponse<ProblemGroup>>('/groups', data)
    return res.data
  },

  async update(id: number, data: { group_name: string }): Promise<ApiResponse<ProblemGroup>> {
    const res = await apiClient.put<ApiResponse<ProblemGroup>>(`/groups/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/groups/${id}`)
    return res.data
  },
}
