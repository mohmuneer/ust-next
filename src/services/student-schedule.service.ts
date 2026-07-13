import { studentApi } from './student-api'

export interface ScheduleEntry {
  id: number
  day_of_week: string
  day_key: string
  start_time: string
  end_time: string
  room: string | null
  notes: string | null
  study_subject_id: number
  employee_id: number | null
  external_employee_id: number | null
  study_group_id: number
  subject_name: string
  subject_code: string | null
  weekly_hours: number
  employee_name: string | null
  employee_email: string | null
  employee_phone: string | null
  employee_degree: string | null
  group_name: string | null
  group_type: string | null
  college_name: string | null
  department_name: string | null
}

export interface ScheduleStudent {
  id: number
  student_number: string
  full_name: string
  email: string | null
  phone: string | null
  college_id: number | null
  department_id: number | null
  study_level_id: number | null
  study_group_id: number | null
  academic_semester_id: number | null
  status: string
  photo: string | null
  college_name: string | null
  department_name: string | null
  level_name: string | null
  group_name: string | null
  group_type: string | null
  semester_name: string | null
  semester_start: string | null
  semester_end: string | null
  semester_is_current: boolean | null
}

export interface ScheduleSubject {
  id: number
  subject_name: string
  subject_code: string | null
  weekly_hours: number
  department_id: number | null
  college_id: number | null
  study_level_id: number | null
  department_name: string | null
  college_name: string | null
}

export interface ScheduleSemester {
  id: number
  semester_name: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
}

export interface StudentScheduleData {
  student: ScheduleStudent | null
  subjects: ScheduleSubject[]
  schedule: ScheduleEntry[]
  semester: ScheduleSemester | null
  total_hours: number
  total_subjects: number
}

export const studentScheduleService = {
  async getStudentSchedule(): Promise<StudentScheduleData> {
    const data = await studentApi.get<any>('/student-schedule')
    return {
      student: data.student || null,
      subjects: data.subjects || [],
      schedule: data.schedule || [],
      semester: data.semester || null,
      total_hours: data.total_hours || 0,
      total_subjects: data.total_subjects || 0,
    }
  },
}
