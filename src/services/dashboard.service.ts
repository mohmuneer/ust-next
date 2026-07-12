import apiClient from '@/lib/axios'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats | null> {
    try {
      const res = await apiClient.get<DashboardStats>('/dashboard-stats')
      return res.data
    } catch { return null }
  },
}
