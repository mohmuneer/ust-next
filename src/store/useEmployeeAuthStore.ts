import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EmployeeUser {
  id: number
  employee_code: string
  full_name: string
  email: string | null
  phone: string | null
  academic_degree: string | null
  specialization: string | null
  job_title_name?: string
  admin_structure_name?: string
  status: string
  file_path: string | null
}

interface EmployeeAuthState {
  employee: EmployeeUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (employee: EmployeeUser, token: string) => void
  setEmployee: (employee: EmployeeUser) => void
  logout: () => void
}

export const useEmployeeAuthStore = create<EmployeeAuthState>()(
  persist(
    (set) => ({
      employee: null,
      token: null,
      isAuthenticated: false,
      setAuth: (employee, token) => set({ employee, token, isAuthenticated: true }),
      setEmployee: (employee) => set({ employee }),
      logout: () => set({ employee: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'employee-auth-storage',
      partialize: (state) => ({
        employee: state.employee,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
