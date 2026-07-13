'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/theme-provider'
import { PermissionsProvider, PermissionGuard } from '@/hooks/use-permissions'
import { useAppStore } from '@/store/useAppStore'
import { cn, getImageUrl } from '@/lib/utils'
import { SWRegistration } from '@/components/sw-registration'
import { PWAInstallBanner } from '@/components/pwa-install-banner'
import BottomNav from '@/components/mobile/bottom-nav'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { systemService } from '@/services/system.service'
import { Moon, Sun } from 'lucide-react'
import { LayoutDashboard, Presentation, MessageSquare, Users, User } from 'lucide-react'
import SplashScreen from '@/components/mobile/splash-screen'

const facultyNavItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'المحاضرات', icon: Presentation, href: '/lectures' },
  { label: 'الرسائل', icon: MessageSquare, href: '/messages' },
  { label: 'الطلاب', icon: Users, href: '/students' },
  { label: 'الحساب', icon: User, href: '/employees' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('splash-shown-faculty')
  })

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen variant="faculty" onComplete={() => setShowSplash(false)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <PermissionsProvider>
      <SWRegistration manifestPath="/manifest-employee.json" />
      <PWAInstallBanner variant="employee" />
      <style>{`
        .print-only, .print-header { display: none; }
        @media print {
          .sidebar-wrapper, .dashboard-header { display: none !important; }
          .dashboard-main { margin-right: 0 !important; padding: 0 !important; }
          .dashboard-main > main { padding: 0 !important; }
          .overflow-x-auto { overflow: visible !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-header { display: block !important; margin-bottom: 2px; }
          .schedule-card { page-break-inside: avoid; }
          [class*="min-w-"] { min-width: auto !important; width: 100% !important; }
          body { background: white !important; font-size: 6.5pt !important; }
          .schedule-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          .schedule-card-header { padding: 1px 8px !important; }
          .schedule-card-header h2 { font-size: 9pt !important; }
          .schedule-grid-inner { min-width: auto !important; width: 100% !important; }
          .schedule-grid-inner > .grid { grid-template-columns: 45px repeat(6,1fr) !important; }
          .schedule-time-header { padding: 1px 2px !important; font-size: 6pt !important; }
          .schedule-day-header { padding: 1px 2px !important; font-size: 7pt !important; }
          .schedule-time-cell { padding: 1px 2px !important; font-size: 5.5pt !important; }
          .schedule-day-cell { min-height: auto !important; padding: 0 !important; }
          .schedule-lecture { padding: 1px 2px !important; font-size: 5.5pt !important; }
          .schedule-lecture .text-sm { font-size: 5.5pt !important; }
          .schedule-lecture .leading-tight { line-height: 1.1 !important; }
          .schedule-lecture .gap-1 { gap: 0 !important; }
          .schedule-lecture .h-3 { width: 5px !important; height: 5px !important; }
          .schedule-lecture .h-2\\.5 { width: 4px !important; height: 4px !important; }
          .schedule-lecture .w-2\\.5 { width: 4px !important; height: 4px !important; }
          .overflow-x-auto { overflow: visible !important; }
          @page { size: landscape; margin: 4mm; }
        }
      `}</style>
      <DashboardMobileDetection>{children}</DashboardMobileDetection>
      </PermissionsProvider>
    </ThemeProvider>
  )
}

function DashboardMobileDetection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const { theme, setTheme } = useAppStore()
  const [isMobile, setIsMobile] = useState(false)
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    systemService.getSettings().then((s) => {
      if (s) {
        setSystemName(s.system_name)
        if (s.system_logo) setSystemLogo(getImageUrl(s.system_logo))
      }
    }).catch(() => {})
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Mobile Header */}
        <header
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 transition-all"
          style={{
            height: '56px',
            paddingTop: 'env(safe-area-inset-top)',
            backgroundColor: 'color-mix(in srgb, #025a87 85%, transparent)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {systemLogo ? (
              <img src={systemLogo} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">UST</span>
              </div>
            )}
            <span className="font-bold text-sm text-white">
              {systemName || 'لوحة التحكم'}
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </header>

        {/* Content */}
        <main
          className="min-h-screen"
          style={{
            paddingTop: 'calc(56px + env(safe-area-inset-top))',
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="animate-in fade-in duration-300">
            <PermissionGuard>{children}</PermissionGuard>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav items={facultyNavItems} activeHref={pathname || ''} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <div
        className={cn(
          'dashboard-main flex flex-col pt-14 transition-all duration-[250ms] ease',
          sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-[300px]'
        )}
      >
        <main className="flex-1 p-4 lg:p-6">
          <PermissionGuard>{children}</PermissionGuard>
        </main>
      </div>
    </div>
  )
}
