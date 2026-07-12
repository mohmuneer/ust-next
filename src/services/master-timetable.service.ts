import apiClient from '@/lib/axios'

export interface MasterTimetableFilters {
  college_id?: number | string
  department_id?: number | string
  program_id?: number | string
  study_level_id?: number | string
  study_group_id?: number | string
  study_subject_id?: number | string
  employee_id?: number | string
  academic_semester_id?: number | string
  building_id?: number | string
  day_of_week?: string
  room?: string
  lecture_type?: string
  instructor_id?: number | string
  search?: string
}

export interface MasterTimetableData {
  schedules: any[]
  stats: {
    total_groups: number
    total_subjects: number
    total_instructors: number
    total_rooms_used: number
    total_rooms: number
    room_occupancy: number
    total_daily: Record<string, number>
    total_weekly: number
    total_weekly_hours: number
    total_conflicts: number
  }
  conflicts: Array<{
    type: string
    message: string
    schedule_id: number
    day: string
    time: string
    instructor?: string
    room?: string
  }>
}

export const masterTimetableService = {
  async getData(filters?: MasterTimetableFilters): Promise<MasterTimetableData> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          params.append(k, String(v))
        }
      })
    }
    const qs = params.toString()
    const res = await apiClient.get<any>(`/master-timetable${qs ? `?${qs}` : ''}`)
    const d = res.data
    return {
      schedules: d?.schedules || [],
      stats: d?.stats || {
        total_groups: 0, total_subjects: 0, total_instructors: 0,
        total_rooms_used: 0, total_rooms: 0, room_occupancy: 0,
        total_daily: {}, total_weekly: 0, total_weekly_hours: 0, total_conflicts: 0,
      },
      conflicts: d?.conflicts || [],
    }
  },
}
