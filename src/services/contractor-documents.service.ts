import apiClient from '@/lib/axios'
import type { ContractorDocument, ApiResponse } from '@/types'

export const contractorDocumentsService = {
  async getAll(): Promise<ContractorDocument[]> {
    try {
      const res = await apiClient.get<ContractorDocument[]>('/contractor-documents')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<ContractorDocument | null> {
    try {
      const res = await apiClient.get<ContractorDocument>(`/contractor-documents/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/contractor-documents', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/contractor-documents/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/contractor-documents/${id}`)
    return res.data
  },
}
