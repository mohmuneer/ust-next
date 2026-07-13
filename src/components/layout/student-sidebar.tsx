'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, User, Calendar, BookOpen, Award, UserCheck,
  Bell, MessageSquare, FileText, CreditCard, Download, LogOut,
  QrCode, Menu, ChevronDown, Search, X, GraduationCap, BookCopy,
  Monitor, FileQuestion, Megaphone, Library, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { removeAuthCookie } from '@/lib/auth-cookies'
import { useNotificationBadge } from '@/components/mobile/notification-badge-provider'

const CSS = {
  sidebarBg: 'var(--theme-sidebar-color, #0f172a)',
  sidebarText: 'var(--theme-sidebar-text, #E5E7EB)',
  sidebarTextMuted: 'color-mix(in srgb, var(--theme-sidebar-text, #E5E7EB) 60%, transparent)',
  sidebarHover: 'var(--theme-sidebar-hover, #1E293B)',
  sidebarActive: 'var(--theme-sidebar-active, var(--color-primary, #2563EB))',
  sidebarActiveText: 'var(--theme-sidebar-active-text, #FFFFFF)',
  sidebarDivider: 'color-mix(in srgb, var(--theme-sidebar-text, #E5E7EB) 12%, transparent)',
}

interface MenuItem {
  title: string
  icon?: any
  href?: string
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
      { title: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
      { title: 'الملف الشخصي', icon: User, href: '/student/profile' },
    ],
  },
  {
    groupKey: 'الدراسة',
    items: [
      { title: 'الجدول الدراسي', icon: Calendar, href: '/student/schedule' },
      { title: 'المواد الدراسية', icon: BookOpen, href: '/student/courses' },
      { title: 'الدرجات', icon: Award, href: '/student/grades' },
    ],
  },
  {
    groupKey: 'الحضور والامتحانات',
    items: [
      { title: 'الحضور', icon: UserCheck, href: '/student/attendance' },
      { title: 'حضور QR', icon: QrCode, href: '/student/qr-attendance' },
      { title: 'الامتحانات', icon: FileQuestion, href: '/student/exams' },
    ],
  },
  {
    groupKey: 'التواصل',
    items: [
      { title: 'الإشعارات', icon: Bell, href: '/student/notifications' },
      { title: 'الرسائل', icon: MessageSquare, href: '/student/messages' },
    ],
  },
  {
    groupKey: 'المالية والمستندات',
    items: [
      { title: 'الرسوم المالية', icon: CreditCard, href: '/student/fees' },
      { title: 'المستندات', icon: Download, href: '/student/documents' },
    ],
  },
  {
    groupKey: 'خدمات أكاديمية',
    items: [
      { title: 'الواجبات', icon: BookOpen, href: '/student/assignments' },
      { title: 'التقويم الأكاديمي', icon: Calendar, href: '/student/academic-calendar' },
      { title: 'المكتبة', icon: Library, href: '/student/library' },
      { title: 'الإعلانات', icon: Megaphone, href: '/student/announcements' },
      { title: 'الطلبات والشكاوى', icon: ClipboardList, href: '/student/requests' },
    ],
  },
]

const COLLAPSED = 80
const EXPANDED = 280

export function StudentSidebar() {
  const pathname = usePathname()
  const { student, logout } = useStudentAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { unreadCount } = useNotificationBadge()

  const isActive = (href?: string) => href && pathname.startsWith(href)

  const hasActiveChild = (item: MenuItem): boolean => {
    if (item.href && isActive(item.href)) return true
    return item.children?.some((c) => isActive(c.href)) ?? false
  }

  useEffect(() => {
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((c) => isActive(c.href))) {
          setOpenMenus((prev) => new Set(prev).add(item.title))
        }
      })
    })
  }, [pathname])

  useEffect(() => {
    if (sidebarCollapsed) setMobileOpen(false)
  }, [sidebarCollapsed])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return menuGroups
    const q = searchQuery.toLowerCase()
    return menuGroups.map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q)
        const childMatch = item.children?.some((c) => c.title.toLowerCase().includes(q))
        return titleMatch || childMatch
      }),
    })).filter((g) => g.items.length > 0)
  }, [searchQuery])

  const sidebarWidth = sidebarCollapsed && !mobileOpen ? COLLAPSED : EXPANDED
  const showLabels = !sidebarCollapsed || mobileOpen

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 right-3 z-[70] p-2 rounded-lg bg-card border border-border shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        suppressHydrationWarning
        style={{ backgroundColor: CSS.sidebarBg, width: sidebarWidth }}
        className={cn(
          'fixed top-0 z-[60] h-screen flex flex-col transition-all duration-[250ms] ease',
          'right-0',
          sidebarCollapsed && !mobileOpen
            ? 'translate-x-full lg:translate-x-0'
            : 'translate-x-0'
        )}
      >
        <div
          className="flex items-center justify-between shrink-0"
          style={{ height: 64, paddingInline: 16, borderBottom: `1px solid ${CSS.sidebarDivider}` }}
        >
          {showLabels && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: CSS.sidebarActive }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-sm truncate" style={{ color: CSS.sidebarText }}>بوابة الطالب</span>
            </div>
          )}
          <button
            suppressHydrationWarning
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(false)
              else setSidebarCollapsed(!sidebarCollapsed)
            }}
            className="p-1.5 rounded-lg shrink-0 mr-auto"
            style={{ color: CSS.sidebarTextMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CSS.sidebarHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {sidebarCollapsed && !mobileOpen ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className="shrink-0"
          style={{ padding: 12, display: showLabels ? 'block' : 'none' }}
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: CSS.sidebarTextMuted }} />
            <input
              suppressHydrationWarning
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
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

        <nav className="flex-1 overflow-y-auto" style={{ padding: 8 }}>
          {filteredGroups.map((group, gi) => (
            <div key={group.groupKey || `g${gi}`}>
              {gi > 0 && (
                <div style={{ height: 1, backgroundColor: CSS.sidebarDivider, marginBlock: 8 }} />
              )}
              {group.groupKey && showLabels && (
                <div style={{ paddingInline: 16, marginBottom: 4, fontSize: 11, fontWeight: 600, color: CSS.sidebarTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.groupKey}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0
                  const active = isActive(item.href)
                  const anyChildActive = hasActiveChild(item)
                  const isOpen = openMenus.has(item.title)

                  const itemStyle: React.CSSProperties = {
                    height: 46, paddingInline: 16,
                    borderRadius: 8, width: '100%',
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontSize: 14,
                    fontWeight: (active || isOpen || anyChildActive) ? 600 : 400,
                    border: 'none', cursor: hasChildren ? 'pointer' : undefined,
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
                    <div key={item.title}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.title)}
                            style={itemStyle}
                            onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = CSS.sidebarHover }}
                            onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                            {showLabels && (
                              <>
                                <span className="flex-1 text-right truncate">{item.title}</span>
                                <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-250', isOpen && 'rotate-180')} />
                              </>
                            )}
                          </button>
                          {isOpen && showLabels && item.children && (
                            <div style={{ marginTop: 2 }}>
                              {item.children.map((child) => {
                                const childActive = isActive(child.href)
                                return (
                                  <Link key={child.href} href={child.href || '#'}
                                    onClick={() => { if (window.innerWidth < 1024) setMobileOpen(false) }}
                                    style={{
                                      height: 42, paddingInlineStart: 52, paddingInlineEnd: 16,
                                      backgroundColor: childActive ? CSS.sidebarActive : 'transparent',
                                      color: childActive ? CSS.sidebarActiveText : CSS.sidebarTextMuted,
                                      borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10,
                                      fontSize: 13, fontWeight: childActive ? 600 : 400,
                                      textDecoration: 'none', transition: 'all 250ms ease',
                                      boxShadow: childActive
                                        ? `inset 3px 0 0 var(--theme-sidebar-active-text, #FFFFFF)`
                                        : 'inset 3px 0 0 transparent',
                                    }}
                                    onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = CSS.sidebarHover }}
                                    onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                                  >
                                    <span className="truncate">{child.title}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link href={item.href || '#'}
                          onClick={() => { if (window.innerWidth < 1024) setMobileOpen(false) }}
                          style={itemStyle}
                          onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = CSS.sidebarHover }}
                          onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                          {showLabels && (
                            <>
                              <span className="flex-1 text-right truncate">{item.title}</span>
                              {item.href === '/student/messages' && unreadCount > 0 ? (
                                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: 'var(--color-danger, #EF4444)' }}>
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                              ) : (
                                <span className="h-4 w-4 shrink-0" />
                              )}
                            </>
                          )}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {showLabels && student && (
          <div style={{ borderTop: `1px solid ${CSS.sidebarDivider}`, padding: 12 }}>
            <div className="flex items-center gap-3 px-2" style={{ height: 46 }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: CSS.sidebarActive }}>
                {student.full_name?.charAt(0) || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: CSS.sidebarText }}>{student.full_name}</p>
                <p className="text-xs truncate" style={{ color: CSS.sidebarTextMuted }}>{student.student_number}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); removeAuthCookie('student_token'); window.location.href = '/student/login' }}
              className="flex items-center gap-2 w-full mt-2 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--color-danger, #EF4444)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-danger, #EF4444) 12%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
