import { studentApi } from './student-api'

export const studentAttendanceService = {
  getRecords(params?: { student_id?: number }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/attendance-records${q}`)
  },
  getSessions(params?: { status?: string }) {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return studentApi.get<any[]>(`/attendance-sessions${q}`)
  },
  getStats(studentId: number) {
    return studentApi.get<any>(`/attendance-stats/${studentId}`)
  },
  scanQr(data: { token: string; student_id: number; device_id?: string; latitude?: number; longitude?: number }) {
    return studentApi.post<any>('/attendance-scan', data)
  },
}
