'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/mobile/bottom-nav'
import { usePathname } from 'next/navigation'
import { useEmployeeAuthStore } from '@/store/useEmployeeAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { ThemeProvider } from '@/components/theme-provider'
import {
  LayoutDashboard,
  Presentation,
  MessageSquare,
  Users,
  User,
  Moon,
  Sun,
} from 'lucide-react'
import { systemService } from '@/services/system.service'
import { getImageUrl } from '@/lib/utils'

const facultyNavItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'المحاضرات', icon: Presentation, href: '/lectures' },
  { label: 'الرسائل', icon: MessageSquare, href: '/messages' },
  { label: 'الطلاب', icon: Users, href: '/students' },
  { label: 'الحساب', icon: User, href: '/employees' },
]

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [systemInfo, setSystemInfo] = useState<{ logo?: string; name?: string } | null>(null)
  const pathname = usePathname()
  const { employee } = useEmployeeAuthStore()
  const { theme, setTheme } = useAppStore()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info = await systemService.getSettings()
        if (info) setSystemInfo({ logo: info.system_logo, name: info.system_name })
      } catch (err) {
        console.error('Failed to fetch system info:', err)
      }
    }
    fetchSystemInfo()
  }, [])

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          scrollBehavior: 'smooth',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Mobile Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            background: 'rgba(2, 90, 135, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {systemInfo?.logo ? (
              <img
                src={getImageUrl(systemInfo.logo)}
                alt={systemInfo?.name || 'UST'}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                U
              </div>
            )}
            <span
              style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              {systemInfo?.name || 'UST'}
            </span>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            style={{
              width: '44px',
              height: '44px',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            marginTop: '56px',
            padding: '16px',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
            minHeight: 'calc(100dvh - 56px)',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          items={facultyNavItems}
          activeHref={pathname}
        />
      </div>
    </ThemeProvider>
  )
}
