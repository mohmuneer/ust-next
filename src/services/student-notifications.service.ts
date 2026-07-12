import { studentApi } from './student-api'

export const studentNotificationsService = {
  getNotifications(params?: { student_id?: number; limit?: number }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/notifications${q}`)
  },
  markRead(id: number) {
    return studentApi.put<any>(`/notifications/${id}`, { is_read: true })
  },
}
