import apiClient from '@/lib/axios'

interface SetupCounts {
  branches: number
  colleges: number
  departments: number
  job_titles: number
  admin_structures: number
  employees: number
  external_employees: number
  study_levels: number
  study_groups: number
  academic_semesters: number
  programs: number
  study_subjects: number
  plan_subjects: number
  subject_relations: number
  buildings: number
  rooms: number
  study_plans: number
  faculty_preferences: number
  employee_assignments: number
  study_schedules: number
  lectures: number
}

async function countAll(url: string): Promise<number> {
  try {
    const res = await apiClient.get(url)
    if (Array.isArray(res.data)) return res.data.length
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data.length
    return 0
  } catch { return 0 }
}

export const setupWorkflowService = {
  async getAllCounts(): Promise<SetupCounts> {
    const [
      branches, colleges, departments,
      job_titles, admin_structures, employees,
      external_employees, study_levels, study_groups,
      academic_semesters, programs, study_subjects,
      plan_subjects, subject_relations, buildings,
      rooms, study_plans, faculty_preferences,
      employee_assignments, study_schedules, lectures,
    ] = await Promise.all([
      countAll('/branches'),
      countAll('/colleges'),
      countAll('/departments'),
      countAll('/job-titles'),
      countAll('/admin-structures'),
      countAll('/employees'),
      countAll('/external-employees'),
      countAll('/study-levels'),
      countAll('/study-groups'),
      countAll('/academic-semesters'),
      countAll('/programs'),
      countAll('/study-subjects'),
      countAll('/plan-subjects'),
      countAll('/subject-relations'),
      countAll('/buildings'),
      countAll('/rooms'),
      countAll('/study-plans'),
      countAll('/faculty-preferences'),
      countAll('/employee-assignments'),
      countAll('/study-schedules'),
      countAll('/lectures'),
    ])

    return {
      branches, colleges, departments,
      job_titles, admin_structures, employees,
      external_employees, study_levels, study_groups,
      academic_semesters, programs, study_subjects,
      plan_subjects, subject_relations, buildings,
      rooms, study_plans, faculty_preferences,
      employee_assignments, study_schedules, lectures,
    }
  },
}

export type { SetupCounts }