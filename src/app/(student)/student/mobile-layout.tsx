'use client'

import BottomNav from '@/components/mobile/bottom-nav'
import { SWRegistration } from '@/components/sw-registration'
import { PWAInstallBanner } from '@/components/pwa-install-banner'
import { ThemeProvider } from '@/components/theme-provider'
import { useAppStore } from '@/store/useAppStore'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { getImageUrl } from '@/lib/utils'
import { systemService } from '@/services/system.service'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'

const studentNavItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
  { label: 'الجدول', icon: Calendar, href: '/student/schedule' },
  { label: 'الرسائل', icon: MessageSquare, href: '/student/messages' },
  { label: 'الخدمات', icon: FileText, href: '/student/documents' },
  { label: 'الحساب', icon: User, href: '/student/profile' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <SWRegistration manifestPath="/manifest-student.json" />
      <PWAInstallBanner variant="student" />
      <MobileLayoutInner>{children}</MobileLayoutInner>
    </ThemeProvider>
  )
}

function MobileLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useAppStore()
  const [systemLogo, setSystemLogo] = useState<string | null>(null)
  const [systemName, setSystemName] = useState<string>('')
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const isPulling = useRef(false)

  useEffect(() => {
    systemService.getSettings().then((s) => {
      if (s) {
        setSystemName(s.system_name)
        if (s.system_logo) setSystemLogo(getImageUrl(s.system_logo))
      }
    }).catch(() => {})
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollRef.current
    if (!el || el.scrollTop > 0) return
    touchStartY.current = e.touches[0].clientY
    isPulling.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return
    const diff = e.touches[0].clientY - touchStartY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, 100))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance > 60) {
      setIsRefreshing(true)
      setPullDistance(40)
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance])

  return (
    <div className="min-h-screen rtl" dir="rtl" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <style>{`
        .mobile-layout-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          padding-top: env(safe-area-inset-top, 0px);
          background: color-mix(in srgb, var(--theme-header-color, #ffffff) 80%, transparent);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid color-mix(in srgb, var(--theme-header-text, #1a1a2e) 10%, transparent);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        [data-theme="dark"] .mobile-layout-header {
          background: color-mix(in srgb, #1a1d23 85%, transparent);
          border-bottom-color: rgba(255, 255, 255, 0.06);
        }

        .mobile-layout-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          padding-top: calc(56px + env(safe-area-inset-top, 0px));
          padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 8px);
          min-height: 100vh;
          scroll-behavior: smooth;
        }

        .mobile-layout-pull-indicator {
          position: fixed;
          top: calc(56px + env(safe-area-inset-top, 0px));
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          transition: height 0.15s ease, opacity 0.15s ease;
          pointer-events: none;
        }

        .mobile-layout-pull-indicator svg {
          animation: pull-spin 0.8s linear infinite;
        }

        @keyframes pull-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes mobile-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-layout-content > * {
          animation: mobile-fade-in 0.25s ease both;
        }
      `}</style>

      <header className="mobile-layout-header">
        <div className="flex items-center gap-2.5">
          {systemLogo ? (
            <img src={systemLogo} alt="" className="h-8 w-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-primary, #2563EB)' }}>
              <img src="/ust-logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
            </div>
          )}
          <span
            className="font-bold text-sm"
            style={{ color: 'var(--theme-header-text, #1a1a2e)' }}
          >
            {systemName || 'بوابة الطالب'}
          </span>
        </div>

        <button
          suppressHydrationWarning
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl transition-colors active:scale-90"
          style={{ color: 'var(--theme-header-text, #1a1a2e)' }}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </header>

      {pullDistance > 0 && (
        <div className="mobile-layout-pull-indicator" style={{ height: pullDistance, opacity: Math.min(pullDistance / 60, 1) }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-primary, #038ed3)' }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}

      <div
        ref={scrollRef}
        className="mobile-layout-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <main className="p-4" style={{ minHeight: 'calc(100vh - 128px)' }}>
          {children}
        </main>
      </div>

      <BottomNav items={studentNavItems} activeHref={pathname || '/student/dashboard'} />
    </div>
  )
}
