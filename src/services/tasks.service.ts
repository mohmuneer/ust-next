import apiClient from '@/lib/axios'
import type { Task, CompleteTaskPayload, TransferTaskPayload, ApiResponse } from '@/types'

export const tasksService = {
  async getAll(params?: Record<string, unknown>): Promise<Task[]> {
    try {
      const res = await apiClient.get<Task[]>('/tasks', { params })
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<Task | null> {
    try {
      const res = await apiClient.get<Task>(`/tasks/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/tasks', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/tasks/${id}`, data)
    return res.data
  },

  async complete(data: CompleteTaskPayload): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/tasks/${data.task_id}`, { status: 'Completed', details: data.completion_notes })
    return res.data
  },

  async transfer(data: TransferTaskPayload): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/tasks/${data.task_id}`, { assigned_to: data.new_technician_id, details: data.transfer_note })
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/tasks/${id}`)
    return res.data
  },
}
