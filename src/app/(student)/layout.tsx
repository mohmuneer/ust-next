'use client'

import { StudentSidebar } from '@/components/layout/student-sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { cn, getImageUrl } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { Moon, Sun } from 'lucide-react'
import { systemService } from '@/services/system.service'
import { SWRegistration } from '@/components/sw-registration'
import { PWAInstallBanner } from '@/components/pwa-install-banner'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useStudentAuthStore()
  const [hydrated, setHydrated] = useState(false)

  const isLoginPage = pathname?.includes('/login')

  useEffect(() => { setHydrated(true) }, [])
  useEffect(() => {
    if (hydrated && !isAuthenticated && !isLoginPage) {
      router.push('/student/login')
    }
  }, [hydrated, isAuthenticated, isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  return (
    <ThemeProvider>
      <SWRegistration manifestPath="/manifest-student.json" />
      <PWAInstallBanner variant="student" />
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </ThemeProvider>
  )
}

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useAppStore()
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')

  useEffect(() => {
    systemService.getSettings().then((s) => {
      if (s) {
        setSystemName(s.system_name)
        if (s.system_logo) setSystemLogo(getImageUrl(s.system_logo))
      }
    }).catch(() => {})
  }, [])

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
              <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
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
