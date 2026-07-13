'use client'

import { StudentSidebar } from '@/components/layout/student-sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { cn, getImageUrl } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Moon, Sun } from 'lucide-react'
import { systemService } from '@/services/system.service'
import { SWRegistration } from '@/components/sw-registration'
import { PWAInstallBanner } from '@/components/pwa-install-banner'
import { PWAUpdateBanner } from '@/components/pwa-update-banner'
import SplashScreen from '@/components/mobile/splash-screen'
import BottomNav from '@/components/mobile/bottom-nav'
import { NotificationBadgeProvider, useNotificationBadge } from '@/components/mobile/notification-badge-provider'
import { LayoutDashboard, Calendar, MessageSquare, FileText, User } from 'lucide-react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('splash-shown-student')
  })

  const isLoginPage = pathname?.includes('/login')

  useEffect(() => { setHydrated(true) }, [])

  if (isLoginPage) return <>{children}</>

  return (
    <ThemeProvider>
      <SWRegistration manifestPath="/manifest-student.json" />
      <PWAInstallBanner variant="student" />
      <PWAUpdateBanner />
      {showSplash ? (
        <SplashScreen variant="student" onComplete={() => setShowSplash(false)} />
      ) : (
        <NotificationBadgeProvider>
          <StudentLayoutInner>{children}</StudentLayoutInner>
        </NotificationBadgeProvider>
      )}
    </ThemeProvider>
  )
}

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useAppStore()
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

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

  const { unreadCount } = useNotificationBadge()

  const studentNavItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
    { label: 'الجدول', icon: Calendar, href: '/student/schedule' },
    { label: 'الرسائل', icon: MessageSquare, href: '/student/messages', badge: unreadCount },
    { label: 'الخدمات', icon: FileText, href: '/student/documents' },
    { label: 'الحساب', icon: User, href: '/student/profile' },
  ]

  if (isMobile) {
    return (
      <div className="min-h-screen" dir="rtl" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        {/* Mobile Header */}
        <header
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 transition-all"
          style={{
            height: '56px',
            paddingTop: 'env(safe-area-inset-top)',
            backgroundColor: 'color-mix(in srgb, var(--theme-header-color, #ffffff) 85%, transparent)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderBottom: '1px solid color-mix(in srgb, var(--theme-header-text, #1a1a2e) 8%, transparent)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {systemLogo ? (
              <img src={systemLogo} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">UST</span>
              </div>
            )}
            <span className="font-bold text-sm" style={{ color: 'var(--theme-header-text, #1a1a2e)' }}>
              {systemName || 'بوابة الطالب'}
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--theme-header-text, #1a1a2e)' }}
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
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav items={studentNavItems} activeHref={pathname || ''} />
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen', 'rtl')} dir="rtl"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <StudentSidebar />
      <header
        className="fixed top-0 left-0 right-0 lg:right-[280px] z-40 h-16 border-b shadow-sm transition-all duration-[250ms] ease flex items-center justify-between px-4 lg:px-6"
        style={{
          backgroundColor: 'var(--theme-header-color, #ffffff)',
          borderColor: 'color-mix(in srgb, var(--theme-header-text, #1a1a2e) 12%, transparent)',
        }}
      >
        <div className="flex items-center gap-2">
          {systemLogo ? (
            <img src={systemLogo} alt="" className="h-8 w-8 rounded-lg object-contain" />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'var(--color-primary, #2563EB)' }}
            >
              <img src="/ust-logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
            </div>
          )}
          <span
            className="font-bold text-sm hidden sm:block"
            style={{ color: 'var(--theme-header-text, #1a1a2e)' }}
          >
            {systemName || 'البوابة الإلكترونية للطالب'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            suppressHydrationWarning
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl transition-colors"
            style={{
              color: 'var(--theme-header-text, #1a1a2e)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--theme-header-text, #1a1a2e) 8%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>
      <div className="dashboard-main flex flex-col pt-16 transition-all duration-[250ms] ease lg:mr-[280px]">
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
