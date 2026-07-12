import apiClient from '@/lib/axios'
import type { SystemLog, ApiResponse } from '@/types'

export interface SystemSettingsData {
  id: number
  system_name: string
  admin_email: string
  contact_number: string
  address: string
  system_logo: string
  maintenance_mode: number
  created_at?: string
  updated_at?: string
}

export const systemService = {
  // Settings
  async getSettings(): Promise<SystemSettingsData | null> {
    try {
      const res = await apiClient.get<SystemSettingsData>('/system-settings')
      return res.data
    } catch { return null }
  },

  async updateSettings(data: Partial<SystemSettingsData>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>('/system-settings', data)
    return res.data
  },

  // Logs
  async getLogs(): Promise<SystemLog[]> {
    try {
      const res = await apiClient.get<SystemLog[]>('/system-logs')
      return res.data
    } catch { return [] }
  },

  // DB Schema
  async getDbSchema(): Promise<any[]> {
    try {
      const res = await apiClient.get('/db-schema')
      return res.data
    } catch { return [] }
  },

  // Backup
  async getBackup(): Promise<any> {
    try {
      const res = await apiClient.get('/db-backup')
      return res.data
    } catch { return null }
  },

  // Visuals (theme)
  async getVisuals(): Promise<SystemVisualsData | null> {
    try {
      const res = await apiClient.get<SystemVisualsData>('/system-visuals')
      return res.data
    } catch { return null }
  },

  async updateVisuals(data: Partial<SystemVisualsData>): Promise<ApiResponse> {
    const res = await apiClient.put<ApiResponse>(`/system-visuals/${data.id}`, data)
    return res.data
  },
}

export interface SystemVisualsData {
  id: number
  system_font: string
  sidebar_color: string
  sidebar_text_color?: string
  sidebar_active_color?: string
  sidebar_hover_color?: string
  sidebar_width?: number
  sidebar_collapsed_width?: number
  header_color: string
  header_text_color?: string
  main_color: string
  add_btn_color: string
  print_btn_color: string
  delete_btn_color: string
  card_color: string
  header_style?: string
  sidebar_style?: string
  card_style?: string
  button_style?: string
  [key: string]: unknown
}
