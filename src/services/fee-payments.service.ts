import apiClient from '@/lib/axios'
import type { FeePayment, ApiResponse } from '@/types'

export const feePaymentsService = {
  async getAll(): Promise<FeePayment[]> {
    try {
      const res = await apiClient.get<FeePayment[]>('/fee-payments')
      return res.data
    } catch { return [] }
  },

  async getById(id: number): Promise<FeePayment | null> {
    try {
      const res = await apiClient.get<FeePayment>(`/fee-payments/${id}`)
      return res.data
    } catch { return null }
  },

  async create(data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/fee-payments', data)
    return res.data
  },

  async update(id: number, data: Record<string, unknown>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/fee-payments/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const res = await apiClient.delete<ApiResponse>(`/fee-payments/${id}`)
    return res.data
  },
}
