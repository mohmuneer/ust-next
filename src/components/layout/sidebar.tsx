'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ListChecks, Building2, GraduationCap, BookOpen,
  Tags, FileText, ClipboardList, Users, ShieldCheck,
  MessageSquare, BarChart3, Bot, Settings, Menu,
  ChevronDown, Search, X, LucideIcon,
  Briefcase, DollarSign, Bell, FileArchive, Clock3, UserCheck,
} from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { usePermissions } from '@/hooks/use-permissions'
import { systemService } from '@/services/system.service'
import { t } from '@/i18n'

const CSS = {
  sidebarBg: 'var(--theme-sidebar-color, #111827)',
  sidebarText: 'var(--theme-sidebar-text, #E5E7EB)',
  sidebarTextMuted: 'color-mix(in srgb, var(--theme-sidebar-text, #E5E7EB) 60%, transparent)',
  sidebarHover: 'var(--theme-sidebar-hover, #1F2937)',
  sidebarActive: 'var(--theme-sidebar-active, var(--color-primary, #2563EB))',
  sidebarActiveText: 'var(--theme-sidebar-active-text, #FFFFFF)',
  sidebarDivider: 'color-mix(in srgb, var(--theme-sidebar-text, #E5E7EB) 12%, transparent)',
}

interface MenuItem {
  title: string
  icon?: LucideIcon
  href?: string
  pageKey?: string
  children?: MenuItem[]
}

interface MenuGroup {
  groupKey: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    groupKey: '',
    items: [
      { title: 'nav.dashboard', icon: LayoutDashboard, href: '/dashboard', pageKey: 'dashboard' },
      { title: 'nav.setupWorkflow', icon: ListChecks, href: '/setup-workflow', pageKey: 'setup-workflow' },
    ],
  },
  {
    groupKey: 'nav.groupGeneralSetup',
    items: [
      {
        title: 'nav.branches', icon: Building2,
        children: [
          { title: 'nav.branches', href: '/branches', pageKey: 'branches' },
          { title: 'nav.colleges', href: '/colleges', pageKey: 'colleges' },
          { title: 'nav.departments', href: '/departments', pageKey: 'departments' },
          { title: 'nav.labs', href: '/labs', pageKey: 'labs' },
          { title: 'nav.studyLevels', href: '/study-levels', pageKey: 'study-levels' },
          { title: 'nav.studyGroups', href: '/study-groups', pageKey: 'study-groups' },
          { title: 'nav.studySubjects', href: '/study-subjects', pageKey: 'study-subjects' },
          { title: 'nav.academicSemesters', href: '/academic-semesters', pageKey: 'academic-semesters' },
        ],
      },
      {
        title: 'nav.problemGroups', icon: Tags,
        children: [
          { title: 'nav.problemGroups', href: '/problem-groups', pageKey: 'problem-groups' },
          { title: 'nav.defaultProblems', href: '/default-problems', pageKey: 'default-problems' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupRequests',
    items: [
      {
        title: 'nav.tasks', icon: ClipboardList,
        children: [
          { title: 'nav.showTasks', href: '/tasks', pageKey: 'tasks' },
          { title: 'nav.newTask', href: '/tasks/new', pageKey: 'tasks' },
          { title: 'nav.taskReports', href: '/tasks/reports', pageKey: 'tasks-reports' },
        ],
      },
      {
        title: 'nav.requests', icon: FileText,
        children: [
          { title: 'nav.showRequests', href: '/requests', pageKey: 'requests' },
          { title: 'nav.requestReports', href: '/requests/reports', pageKey: 'requests-reports' },
          { title: 'nav.requestsOversight', href: '/requests/oversight', pageKey: 'requests-oversight' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupStudentManagement',
    items: [
      {
        title: 'nav.studentData', icon: GraduationCap,
        children: [
          { title: 'nav.students', href: '/students', pageKey: 'students' },
          { title: 'nav.guardians', href: '/guardians', pageKey: 'guardians' },
          { title: 'nav.studentReports', href: '/students/reports', pageKey: 'student-reports' },
        ],
      },
      {
        title: 'nav.ePortal', icon: GraduationCap,
        children: [
          { title: 'nav.exams', href: '/exams', pageKey: 'exams' },
          { title: 'nav.courseSyllabi', href: '/course-syllabi', pageKey: 'course-syllabi' },
          { title: 'nav.examSchedules', href: '/exam-schedules', pageKey: 'exam-schedules' },
          { title: 'nav.examSeating', href: '/exam-seating', pageKey: 'exam-seating' },
          { title: 'nav.examGrades', href: '/exam-grades', pageKey: 'exam-grades' },
        ],
      },
      {
        title: 'nav.attendance', icon: UserCheck,
        children: [
          { title: 'nav.attendanceSessions', href: '/attendance-sessions', pageKey: 'attendance-sessions' },
          { title: 'nav.attendanceRecords', href: '/attendance-records', pageKey: 'attendance-records' },
          { title: 'nav.attendanceReports', href: '/attendance/reports', pageKey: 'attendance-reports' },
        ],
      },
      {
        title: 'nav.academic', icon: GraduationCap,
        children: [
          { title: 'nav.academicRecords', href: '/academic-records', pageKey: 'academic-records' },
          { title: 'nav.academicWarnings', href: '/academic-warnings', pageKey: 'academic-warnings' },
          { title: 'nav.studentEnrollments', href: '/student-enrollments', pageKey: 'student-enrollments' },
          { title: 'nav.studentSemesterGpa', href: '/student-semester-gpa', pageKey: 'student-semester-gpa' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupAcademic',
    items: [
      {
        title: 'nav.teachingStructure', icon: BookOpen,
        children: [
          { title: 'nav.programs', href: '/programs', pageKey: 'programs' },
          { title: 'nav.studyPlans', href: '/study-plans', pageKey: 'study-plans' },
          { title: 'nav.subjectRelations', href: '/subject-relations', pageKey: 'subject-relations' },
          { title: 'nav.buildings', href: '/buildings', pageKey: 'buildings' },
          { title: 'nav.rooms', href: '/rooms', pageKey: 'rooms' },
          { title: 'nav.studySchedules', href: '/study-schedules', pageKey: 'study-schedules' },
          { title: 'nav.masterTimetable', href: '/master-timetable', pageKey: 'master-timetable' },
          { title: 'nav.studyHours', href: '/study-hours', pageKey: 'study-hours' },
          { title: 'nav.lectures', href: '/lectures', pageKey: 'lectures' },
          { title: 'nav.facultyPreferences', href: '/faculty-preferences', pageKey: 'faculty-preferences' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupHR',
    items: [
      {
        title: 'nav.employeesMenu', icon: Briefcase,
        children: [
          { title: 'nav.adminStructures', href: '/admin-structures', pageKey: 'admin-structures' },
          { title: 'nav.jobTitles', href: '/job-titles', pageKey: 'job-titles' },
          { title: 'nav.employees', href: '/employees', pageKey: 'employees' },
          { title: 'nav.externalEmployees', href: '/external-employees', pageKey: 'external-employees' },
        ],
      },
      {
        title: 'nav.contractors', icon: Briefcase,
        children: [
          { title: 'nav.contractors', href: '/contractors', pageKey: 'contractors' },
          { title: 'nav.contractorDocuments', href: '/contractor-documents', pageKey: 'contractor-documents' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupFinance',
    items: [
      {
        title: 'nav.finance', icon: DollarSign,
        children: [
          { title: 'nav.feeTypes', href: '/fee-types', pageKey: 'fee-types' },
          { title: 'nav.studentFees', href: '/student-fees', pageKey: 'student-fees' },
          { title: 'nav.feePayments', href: '/fee-payments', pageKey: 'fee-payments' },
          { title: 'nav.scholarships', href: '/scholarships', pageKey: 'scholarships' },
        ],
      },
    ],
  },
  {
    groupKey: 'nav.groupDocuments',
    items: [
      {
        title: 'nav.documents', icon: FileArchive,
        children: [
          { title: 'nav.documentCategories', href: '/document-categories', pageKey: 'document-categories' },
          { title: 'nav.documents', href: '/documents', pageKey: 'documents' },
        ],
      },
      { title: 'nav.messages', icon: MessageSquare, href: '/messages', pageKey: 'messages' },
      { title: 'nav.reports', icon: BarChart3, href: '/reports', pageKey: 'reports' },
    ],
  },
  {
    groupKey: 'nav.groupSystem',
    items: [
      {
        title: 'nav.userData', icon: Users,
        children: [
          { title: 'nav.showUsers', href: '/users', pageKey: 'users' },
          { title: 'nav.addUser', href: '/users/new', pageKey: 'users' },
          { title: 'nav.userReports', href: '/users/reports', pageKey: 'users-reports' },
          { title: 'nav.userProfile', href: '/users/profile', pageKey: 'users-profile' },
        ],
      },
      {
        title: 'nav.permissionsMenu', icon: ShieldCheck,
        children: [
          { title: 'nav.roles', href: '/roles', pageKey: 'roles' },
          { title: 'nav.addRole', href: '/roles/new', pageKey: 'roles' },
          { title: 'nav.assignPermissions', href: '/roles/assign', pageKey: 'assign-permissions' },
          { title: 'nav.userPermissions', href: '/permissions/users', pageKey: 'permissions-users' },
        ],
      },
      {
        title: 'nav.notifications', icon: Bell,
        children: [
          { title: 'nav.notificationTemplates', href: '/notification-templates', pageKey: 'notification-templates' },
          { title: 'nav.notifications', href: '/notifications', pageKey: 'notifications' },
        ],
      },
      {
        title: 'nav.scheduling', icon: Clock3,
        children: [
          { title: 'nav.timeSlots', href: '/time-slots', pageKey: 'time-slots' },
          { title: 'nav.academicCalendar', href: '/academic-calendar', pageKey: 'academic-calendar' },
        ],
      },
      {
        title: 'nav.systemConfig', icon: Settings,
        children: [
          { title: 'nav.systemSettings', href: '/system/settings', pageKey: 'system-settings' },
          { title: 'nav.systemVisuals', href: '/system/visuals', pageKey: 'system-visuals' },
          { title: 'nav.systemLogs', href: '/system/logs', pageKey: 'system-logs' },
          { title: 'nav.systemBackup', href: '/system/backup', pageKey: 'backup' },
          { title: 'nav.systemDbSchema', href: '/system/db-schema', pageKey: 'db-schema' },
        ],
      },
      { title: 'nav.chatbot', icon: Bot, href: '/chatbot', pageKey: 'chatbot' },
      { title: 'nav.settings', icon: Settings, href: '/settings', pageKey: 'settings' },
    ],
  },
]

const COLLAPSED = 80
const EXPANDED = 300

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, mobileOpen, setMobileOpen, language } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())
  const [systemName, setSystemName] = useState('')
  const [systemLogo, setSystemLogo] = useState('')

  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen])

  const tl = (key: string) => t(key, language)

  useEffect(() => {
    systemService.getSettings().then((s) => {
      if (s) {
        setSystemName(s.system_name)
        if (s.system_logo) setSystemLogo(getImageUrl(s.system_logo))
      }
    })
  }, [])

  const { pagePerms, canView, isEmployee, currentUser, roleName, jobTitleName, isLoading: permsLoading } = usePermissions()

  const hasPermission = useCallback((pageKey?: string): boolean => {
    if (!pageKey) return false
    if (permsLoading) return false
    return canView(pageKey)
  }, [permsLoading, canView])

  const visibleGroups = useMemo(() => {
    if (permsLoading) return []
    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items
          .filter((item) => {
            if (item.href && item.pageKey) return hasPermission(item.pageKey)
            if (item.children) return item.children.some((c) => hasPermission(c.pageKey))
            return false
          })
          .map((item) => {
            if (item.children) return { ...item, children: item.children.filter((c) => hasPermission(c.pageKey)) }
            return item
          }),
      }))
      .filter((g) => g.items.length > 0)
  }, [permsLoading, hasPermission])

  const isActive = (href?: string) => href && pathname.startsWith(href)

  const hasActiveChild = (item: MenuItem): boolean => {
    if (item.href && isActive(item.href)) return true
    return item.children?.some((c) => isActive(c.href)) ?? false
  }

  // Auto-expand active parent menus on route change
  useEffect(() => {
    visibleGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((c) => isActive(c.href))) {
          setOpenMenus((prev) => new Set(prev).add(item.title))
        }
      })
    })
  }, [pathname, visibleGroups])

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  // Close mobile drawer when resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeMobile()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeMobile])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return visibleGroups
    const q = searchQuery.toLowerCase()
    return visibleGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (tl(item.title).toLowerCase().includes(q)) {
            if (!openMenus.has(item.title)) toggleMenu(item.title)
            return true
          }
          if (item.children?.some((c) => tl(c.title).toLowerCase().includes(q))) {
            if (!openMenus.has(item.title)) toggleMenu(item.title)
            return true
          }
          return false
        }),
      }))
      .filter((g) => g.items.length > 0)
  }, [searchQuery, visibleGroups])

  const showLabels = !sidebarCollapsed || mobileOpen
  const sidebarWidth = sidebarCollapsed && !mobileOpen ? COLLAPSED : EXPANDED

  return (
    <>
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-[90] lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: CSS.sidebarBg, width: sidebarWidth }}
        className={cn(
          'sidebar-wrapper fixed top-0 h-screen flex flex-col transition-transform duration-300 ease-in-out',
          'right-0',
          mobileOpen ? 'z-[100] translate-x-0' : 'z-[50] translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ height: 64, paddingInline: 16, borderBottom: `1px solid ${CSS.sidebarDivider}` }}
        >
          {showLabels && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {systemLogo ? (
                <img src={systemLogo} alt="" className="w-9 h-9 rounded-lg object-contain shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: CSS.sidebarActive }}>
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-semibold text-sm truncate" style={{ color: CSS.sidebarText }}>
                {systemName || 'UST'}
              </span>
            </div>
          )}
          <button
            suppressHydrationWarning
            onClick={() => {
              if (mobileOpen) closeMobile()
              else toggleSidebar()
            }}
            className="p-1.5 rounded-lg transition-colors duration-200 shrink-0 mr-auto"
            style={{ color: CSS.sidebarTextMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CSS.sidebarHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Search */}
        {showLabels && (
          <div className="shrink-0" style={{ padding: 12 }}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: CSS.sidebarTextMuted }} />
              <input
                suppressHydrationWarning
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search', language)}
                style={{
                  backgroundColor: CSS.sidebarHover, color: CSS.sidebarText,
                  height: 40, paddingInline: '36px 12px',
                  borderRadius: 8, border: 'none', width: '100%',
                  fontSize: 13, outline: 'none',
                }}
                className="placeholder:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: 8 }}>
          {filteredGroups.map((group, gi) => {
            const hasTitle = group.groupKey && showLabels
            return (
              <div key={group.groupKey || `g${gi}`}>
                {gi > 0 && (
                  <div style={{ height: 1, backgroundColor: CSS.sidebarDivider, marginBlock: 8 }} />
                )}

                {hasTitle && (
                  <div
                    style={{
                      paddingInline: 16,
                      marginBottom: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: CSS.sidebarTextMuted,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tl(group.groupKey)}
                  </div>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0
                    const active = isActive(item.href)
                    const anyChildActive = hasActiveChild(item)
                    const isOpen = openMenus.has(item.title)

                    const itemStyle: React.CSSProperties = {
                      height: 46,
                      paddingInline: 16,
                      borderRadius: 8,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      fontWeight: (active || isOpen || anyChildActive) ? 600 : 400,
                      border: 'none',
                      cursor: hasChildren ? 'pointer' : undefined,
                      transition: 'all 250ms ease',
                      textDecoration: 'none',
                    }

                    if (hasChildren) {
                      itemStyle.backgroundColor = isOpen ? CSS.sidebarHover : 'transparent'
                      itemStyle.color = isOpen ? CSS.sidebarText : CSS.sidebarTextMuted
                      itemStyle.boxShadow = anyChildActive && !isOpen
                        ? `inset 3px 0 0 ${CSS.sidebarActive}`
                        : 'inset 3px 0 0 transparent'
                    } else {
                      itemStyle.backgroundColor = active ? CSS.sidebarActive : 'transparent'
                      itemStyle.color = active ? CSS.sidebarActiveText : CSS.sidebarTextMuted
                      itemStyle.boxShadow = active
                        ? `inset 3px 0 0 var(--theme-sidebar-active-text, #FFFFFF)`
                        : 'inset 3px 0 0 transparent'
                    }

                    return (
                      <div key={item.href || (hasChildren ? item.title + '-group' : item.title)}>
                        {hasChildren ? (
                          <>
                            <button
                              onClick={() => toggleMenu(item.title)}
                              style={itemStyle}
                              onMouseEnter={(e) => {
                                if (!isOpen) e.currentTarget.style.backgroundColor = CSS.sidebarHover
                              }}
                              onMouseLeave={(e) => {
                                if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                              {showLabels && (
                                <>
                                  <span className="flex-1 text-right truncate">{tl(item.title)}</span>
                                  <ChevronDown
                                    className={cn(
                                      'h-4 w-4 shrink-0 transition-transform duration-250',
                                      isOpen && 'rotate-180'
                                    )}
                                  />
                                </>
                              )}
                            </button>

                            {isOpen && showLabels && item.children && (
                              <div style={{ marginTop: 2 }}>
                                {item.children.map((child, ci) => {
                                  const childActive = isActive(child.href)
                                  return (
                                    <Link
                                      key={child.href || ci}
                                      href={child.href || '#'}
                                      onClick={closeMobile}
                                      style={{
                                        height: 42,
                                        paddingInlineStart: 52,
                                        paddingInlineEnd: 16,
                                        backgroundColor: childActive ? CSS.sidebarActive : 'transparent',
                                        color: childActive ? CSS.sidebarActiveText : CSS.sidebarTextMuted,
                                        borderRadius: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        fontSize: 13,
                                        fontWeight: childActive ? 600 : 400,
                                        textDecoration: 'none',
                                        transition: 'all 250ms ease',
                                        boxShadow: childActive
                                          ? `inset 3px 0 0 var(--theme-sidebar-active-text, #FFFFFF)`
                                          : 'inset 3px 0 0 transparent',
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!childActive) e.currentTarget.style.backgroundColor = CSS.sidebarHover
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!childActive) e.currentTarget.style.backgroundColor = 'transparent'
                                      }}
                                    >
                                      <span className="truncate">{tl(child.title)}</span>
                                    </Link>
                                  )
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <Link
                            href={item.href || '#'}
                            onClick={closeMobile}
                            style={itemStyle}
                            onMouseEnter={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = CSS.sidebarHover
                            }}
                            onMouseLeave={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                            {showLabels && (
                              <>
                                <span className="flex-1 text-right truncate">{tl(item.title)}</span>
                                <span className="h-4 w-4 shrink-0" />
                              </>
                            )}
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User Info */}
        {showLabels && currentUser && (
          <div style={{ borderTop: `1px solid ${CSS.sidebarDivider}`, padding: 12 }}>
            <div className="flex items-center gap-3 px-2" style={{ height: 46 }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{ backgroundColor: currentUser.file_path ? 'transparent' : CSS.sidebarActive }}
              >
                {currentUser.file_path ? (
                  <img src={getImageUrl(currentUser.file_path)} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentUser.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: CSS.sidebarText }}>{currentUser.full_name}</p>
                <p className="text-xs truncate" style={{ color: CSS.sidebarTextMuted }}>
                  {isEmployee ? (jobTitleName || 'موظف') : (roleName || 'مستخدم')}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
