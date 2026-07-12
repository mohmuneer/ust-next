import apiClient from '@/lib/axios'
import type { AuthResponse, LoginRequest, User } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/auth/profile')
    return res.data
  },

  async refreshToken(): Promise<{ token: string }> {
    const res = await apiClient.post<{ token: string }>('/auth/refresh')
    return res.data
  },

  async checkAuth(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify')
      return true
    } catch {
      return false
    }
  },
}
