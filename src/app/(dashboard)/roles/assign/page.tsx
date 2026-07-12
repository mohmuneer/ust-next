'use client'

import { useState, useMemo, useEffect, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService, userPermissionsService, employeePermissionsService, rolePagePermissionsService } from '@/services/roles.service'
import { usersService } from '@/services/users.service'
import { employeesService } from '@/services/employees.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Save, ShieldCheck, Check, X as XIcon, Users, Briefcase, Search, CheckCircle2 } from 'lucide-react'
import { SYSTEM_PAGES } from '@/lib/page-permissions'
import type { User, Employee } from '@/types'
import type { PagePermissionsMap } from '@/lib/page-permissions'

interface RolePerms {
  can_view: boolean
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
}

type PageKey = string

const ACTIONS = [
  { key: 'can_view' as const, label: 'عرض/بحث', short: 'عرض' },
  { key: 'can_add' as const, label: 'إضافة', short: 'إضافة' },
  { key: 'can_edit' as const, label: 'تعديل', short: 'تعديل' },
  { key: 'can_delete' as const, label: 'حذف', short: 'حذف' },
]

export default function AssignPermissionsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'users' | 'employees'>('users')
  const [selectedUserId, setSelectedUserId] = useState(0)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(0)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null)
  const [perms, setPerms] = useState<Record<PageKey, RolePerms>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSearch, setPageSearch] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getAll(),
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAll(),
  })

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles', selectedUserId],
    queryFn: () => userPermissionsService.getUserRoles(selectedUserId),
    enabled: tab === 'users' && selectedUserId > 0,
  })

  const { data: employeeRoles } = useQuery({
    queryKey: ['employee-roles', selectedEmployeeId],
    queryFn: () => employeePermissionsService.getEmployeeRoles(selectedEmployeeId),
    enabled: tab === 'employees' && selectedEmployeeId > 0,
  })

  const { data: savedPerms } = useQuery({
    queryKey: ['role-page-permissions', activeRoleId],
    queryFn: () => rolePagePermissionsService.getByRole(activeRoleId!),
    enabled: activeRoleId != null,
  })

  const assignUserMutation = useMutation({
    mutationFn: () => userPermissionsService.assign(selectedUserId, selectedRoleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', selectedUserId] })
      setSuccessMessage('تم حفظ أدوار المستخدم بنجاح')
      setShowSuccessModal(true)
    },
  })

  const assignEmployeeMutation = useMutation({
    mutationFn: () => employeePermissionsService.assign(selectedEmployeeId, selectedRoleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles', selectedEmployeeId] })
      setSuccessMessage('تم حفظ أدوار الموظف بنجاح')
      setShowSuccessModal(true)
    },
  })

  const savePermsMutation = useMutation({
    mutationFn: () => rolePagePermissionsService.save(activeRoleId!, perms),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-page-permissions', activeRoleId] })
      setSuccessMessage('تم حفظ صلاحيات الصفحات بنجاح')
      setShowSuccessModal(true)
    },
  })

  const handleUserChange = (userId: number) => {
    setSelectedUserId(userId)
    setSelectedRoleIds([])
    setActiveRoleId(null)
  }

  const handleEmployeeChange = (empId: number) => {
    setSelectedEmployeeId(empId)
    setSelectedRoleIds([])
    setActiveRoleId(null)
  }

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    )
  }

  const currentRoles = tab === 'users' ? userRoles : employeeRoles
  const activeRoleIds = currentRoles?.map((ur: any) => ur.role_id) || []

  const groups = useMemo(() => {
    const g: Record<string, typeof SYSTEM_PAGES> = {}
    for (const p of SYSTEM_PAGES) {
      if (!g[p.group]) g[p.group] = []
      g[p.group].push(p)
    }
    return g
  }, [])

  const filteredGroups = useMemo(() => {
    const q = pageSearch.toLowerCase()
    if (!q) return groups
    const filtered: Record<string, typeof SYSTEM_PAGES> = {}
    for (const [group, pages] of Object.entries(groups)) {
      const matched = pages.filter(p =>
        p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || group.toLowerCase().includes(q)
      )
      if (matched.length > 0) filtered[group] = matched
    }
    return filtered
  }, [groups, pageSearch])

  const handleSelectRole = (roleId: number) => {
    setActiveRoleId(roleId === activeRoleId ? null : roleId)
    setPageSearch('')
  }

  useEffect(() => {
    if (!savedPerms) return
    const p: Record<PageKey, RolePerms> = {}
    for (const page of SYSTEM_PAGES) {
      const saved = savedPerms[page.key]
      p[page.key] = saved || { can_view: false, can_add: false, can_edit: false, can_delete: false }
    }
    setPerms(p)
  }, [savedPerms])

  const setAll = (value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev }
      for (const page of SYSTEM_PAGES) {
        if (next[page.key]) {
          next[page.key] = { can_view: value, can_add: value, can_edit: value, can_delete: value }
        }
      }
      return next
    })
  }

  const setGroup = (group: string, value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev }
      for (const page of (groups[group] || [])) {
        if (next[page.key]) {
          next[page.key] = { can_view: value, can_add: value, can_edit: value, can_delete: value }
        }
      }
      return next
    })
  }

  const togglePerm = (pageKey: string, action: keyof RolePerms) => {
    setPerms((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [action]: !prev[pageKey]?.[action] },
    }))
  }

  const pagePerms = useMemo(() => perms, [perms])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = searchTerm.toLowerCase()
    return (users || []).filter((u: User) =>
      u.status === 1 &&
      (!q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    )
  }, [users, searchTerm])

  const filteredEmployees = useMemo(() => {
    if (!employees) return []
    const q = searchTerm.toLowerCase()
    return (employees || []).filter((e: Employee) =>
      e.status === 'active' &&
      (!q || e.full_name?.toLowerCase().includes(q) || e.employee_code?.toLowerCase().includes(q) || e.specialization?.toLowerCase().includes(q) || e.job_title_name?.toLowerCase().includes(q))
    )
  }, [employees, searchTerm])

  const isAnythingSelected = tab === 'users' ? selectedUserId > 0 : selectedEmployeeId > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="توزيع الصلاحيات"
        description="تحديد أدوار المستخدمين والموظفين وصلاحيات الصفحات لكل دور"
      />

      {/* User & Role Assignment Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users/Employees List */}
        <Card>
          <CardBody>
            {/* Tabs */}
            <div className="flex rounded-lg border border-border overflow-hidden mb-3">
              <button
                onClick={() => { setTab('users'); setSelectedUserId(0); setSelectedEmployeeId(0); setSelectedRoleIds([]); setActiveRoleId(null); setSearchTerm('') }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  tab === 'users'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Users className="h-4 w-4" /> المستخدمين
              </button>
              <button
                onClick={() => { setTab('employees'); setSelectedUserId(0); setSelectedEmployeeId(0); setSelectedRoleIds([]); setActiveRoleId(null); setSearchTerm('') }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  tab === 'employees'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Briefcase className="h-4 w-4" /> الموظفين
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tab === 'users' ? 'بحث بالاسم أو البريد...' : 'بحث بالاسم أو الرقم الوظيفي أو الرقم القومي...'}
                className="w-full pr-9 pl-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {tab === 'users' && filteredUsers.map((user: User) => (
                <button
                  key={user.id}
                  onClick={() => handleUserChange(user.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedUserId === user.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {user.full_name}
                  <span className="text-xs text-muted-foreground block">{user.email}</span>
                </button>
              ))}
              {tab === 'employees' && filteredEmployees.map((emp: Employee) => (
                <button
                  key={emp.id}
                  onClick={() => handleEmployeeChange(emp.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedEmployeeId === emp.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {emp.full_name}
                  <span className="text-xs text-muted-foreground block">{emp.employee_code} - {emp.specialization || emp.job_title_name || ''}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Roles */}
        <div className="md:col-span-2 space-y-4">
          {isAnythingSelected ? (
            <>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      الأدوار المتاحة
                      <span className="text-sm text-muted-foreground font-normal mr-2">
                        (اختر الأدوار لهذا {tab === 'users' ? 'المستخدم' : 'الموظف'})
                      </span>
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => tab === 'users' ? assignUserMutation.mutate() : assignEmployeeMutation.mutate()}
                      isLoading={tab === 'users' ? assignUserMutation.isPending : assignEmployeeMutation.isPending}
                    >
                      <Save className="h-4 w-4 ml-1" /> حفظ الأدوار
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(roles || []).map((role: any) => {
                      const isActive = activeRoleIds.includes(role.id)
                      const isSelected = selectedRoleIds.includes(role.id)
                      return (
                        <label
                          key={role.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isActive || isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected || isActive}
                            onChange={() => toggleRole(role.id)}
                            className="rounded"
                          />
                          <ShieldCheck className={`h-5 w-5 ${isActive || isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{role.role_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{role.role_code}</p>
                          </div>
                          {isActive && !isSelected && (
                            <span className="text-xs text-green-600 shrink-0">مفعل</span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSelectRole(role.id) }}
                            className={`shrink-0 px-2 py-1 text-xs rounded-md border transition-colors ${
                              activeRoleId === role.id
                                ? 'bg-primary text-white border-primary'
                                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                            }`}
                          >
                            صلاحيات الصفحات
                          </button>
                        </label>
                      )
                    })}
                  </div>
                </CardBody>
              </Card>

              {currentRoles && currentRoles.length > 0 && (
                <Card>
                  <CardBody>
                    <h3 className="font-semibold mb-3">الأدوار الحالية</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentRoles.map((ur: any) => (
                        <span key={ur.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {ur.role_name}
                        </span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-10 text-muted-foreground">
                  الرجاء اختيار {tab === 'users' ? 'مستخدم' : 'موظف'} من القائمة
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Page Permissions Matrix */}
      {activeRoleId && (
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  صلاحيات الصفحات للدور
                  <span className="text-primary mr-2">
                    {roles?.find((r: any) => r.id === activeRoleId)?.role_name}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  حدد صلاحيات (عرض/إضافة/تعديل/حذف) لكل صفحة من صفحات النظام
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    placeholder="بحث عن صفحة..."
                    className="pr-9 pl-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors w-52"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                  <Check className="h-4 w-4 ml-1" /> تحديد الكل
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                  <XIcon className="h-4 w-4 ml-1" /> إلغاء الكل
                </Button>
                <Button
                  size="sm"
                  onClick={() => savePermsMutation.mutate()}
                  isLoading={savePermsMutation.isPending}
                >
                  <Save className="h-4 w-4 ml-1" /> حفظ الصلاحيات
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase w-1/3">الصفحة</th>
                    {ACTIONS.map((a) => (
                      <th key={a.key} className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase w-[100px]">
                        {a.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(filteredGroups).map(([group, pages]) => (
                    <Fragment key={group}>
                      <tr className="bg-muted/20">
                        <td className="px-4 py-2 text-sm font-bold text-foreground" colSpan={5}>
                          <div className="flex items-center justify-between">
                            <span>{group}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setGroup(group, true)}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                تحديد الكل
                              </button>
                              <button
                                onClick={() => setGroup(group, false)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                إلغاء الكل
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {pages.map((page) => {
                        const p = pagePerms[page.key]
                        return (
                          <tr key={page.key} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-sm">{page.label}</td>
                            {ACTIONS.map((a) => {
                              const checked = p?.[a.key] || false
                              return (
                                <td key={a.key} className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => togglePerm(page.key, a.key)}
                                    className={`w-8 h-8 rounded-md border-2 transition-all flex items-center justify-center mx-auto ${
                                      checked
                                        ? 'bg-primary border-primary text-white shadow-sm'
                                        : 'border-border hover:border-primary/50 text-transparent'
                                    }`}
                                  >
                                    {checked && <Check className="h-4 w-4" />}
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="تم بنجاح"
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-center text-lg font-medium">{successMessage}</p>
        </div>
      </Modal>
    </div>
  )
}
