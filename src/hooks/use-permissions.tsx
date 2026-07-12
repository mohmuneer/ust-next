'use client'

import { useEffect, createContext, useContext, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { useEmployeeAuthStore } from '@/store/useEmployeeAuthStore'
import { rolePagePermissionsService } from '@/services/roles.service'
import { getPageKeyFromPath } from '@/lib/page-permissions'
import type { PagePermissionsMap } from '@/lib/page-permissions'

interface PermissionsContextValue {
  pagePerms: PagePermissionsMap
  isLoading: boolean
  isEmployee: boolean
  currentUser: ReturnType<typeof useAuthStore.getState>['user'] | ReturnType<typeof useEmployeeAuthStore.getState>['employee']
  roleName: string | undefined
  jobTitleName: string | undefined
  canView: (pageKey: string) => boolean
  canAdd: (pageKey: string) => boolean
  canEdit: (pageKey: string) => boolean
  canDelete: (pageKey: string) => boolean
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const { employee } = useEmployeeAuthStore()
  const isEmployee = !!employee && !user

  const { data: pagePerms, isLoading } = useQuery<PagePermissionsMap>({
    queryKey: ['user-page-permissions', isEmployee ? `emp-${employee?.id}` : user?.id],
    queryFn: () => {
      if (isEmployee && employee?.id) {
        return rolePagePermissionsService.getByEmployee(employee.id)
      }
      return rolePagePermissionsService.getByUser(user!.id)
    },
    enabled: !!(isEmployee ? employee?.id : user?.id),
    staleTime: 5 * 60 * 1000,
  })

  const resolved = pagePerms ?? {}

  const value: PermissionsContextValue = {
    pagePerms: resolved,
    isLoading,
    isEmployee,
    currentUser: user || employee,
    roleName: user?.role_name,
    jobTitleName: employee?.job_title_name,
    canView: (pageKey: string) => resolved[pageKey]?.can_view === true,
    canAdd: (pageKey: string) => resolved[pageKey]?.can_add === true,
    canEdit: (pageKey: string) => resolved[pageKey]?.can_edit === true,
    canDelete: (pageKey: string) => resolved[pageKey]?.can_delete === true,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext)
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider')
  return ctx
}

export function PermissionGuard({ pageKey: overrideKey, children }: { pageKey?: string; children: ReactNode }) {
  const pathname = usePathname()
  const pageKey = overrideKey || getPageKeyFromPath(pathname)
  const { canView, isLoading } = usePermissions()
  const router = useRouter()

  const isDashboard = pathname === '/dashboard' || pathname === '/'

  useEffect(() => {
    if (!isLoading && pageKey && !canView(pageKey) && !isDashboard) {
      router.replace('/dashboard')
    }
  }, [isLoading, canView, pageKey, router, isDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!pageKey || (!canView(pageKey) && !isDashboard)) return null

  return <>{children}</>
}
