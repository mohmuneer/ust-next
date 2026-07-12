import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudentUser {
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
  college_name?: string
  department_name?: string
  level_name?: string
  group_name?: string
  semester_name?: string
  cumulative_gpa?: string
  total_earned_hours?: number
  total_gpa_points?: string
  academic_status?: string
  enrollment_date?: string
  expected_graduation_date?: string | null
  nationality?: string | null
  birth_date?: string | null
  gender?: string | null
  address?: string | null
  photo?: string | null
}

interface StudentAuthState {
  student: StudentUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (student: StudentUser, token: string) => void
  setStudent: (student: StudentUser) => void
  logout: () => void
}

export const useStudentAuthStore = create<StudentAuthState>()(
  persist(
    (set) => ({
      student: null,
      token: null,
      isAuthenticated: false,
      setAuth: (student, token) => set({ student, token, isAuthenticated: true }),
      setStudent: (student) => set({ student }),
      logout: () => set({ student: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'student-auth-storage',
      partialize: (state) => ({
        student: state.student,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
