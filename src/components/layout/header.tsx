'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, User, LogOut, Search,
  Menu, Maximize2, Minimize2, Moon, Sun,
  MoreVertical,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useEmployeeAuthStore } from '@/store/useEmployeeAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { removeAuthCookie } from '@/lib/auth-cookies'
import { cn } from '@/lib/utils'
import { t } from '@/i18n'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getImageUrl } from '@/lib/utils'

function hexWithAlpha(hex: string, alpha: number): string {
  if (!hex || hex.length < 6) return `rgba(0,0,0,${alpha})`
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getContrastColor(hex: string): string {
  if (!hex || hex.length < 6) return '#000000'
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#1a1a2e' : '#ffffff'
}

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { employee } = useEmployeeAuthStore()
  const { setMobileOpen, theme, setTheme, language } = useAppStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount] = useState(0)
  const moreRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [visuals, setVisuals] = useState<{ headerBg: string; textColor: string; primary: string }>({
    headerBg: '#ffffff',
    textColor: '#1a1a2e',
    primary: '#038ed3',
  })

  const currentUser = user || employee
  const isEmployee = !!employee && !user

  useEffect(() => {
    const update = () => {
      const root = getComputedStyle(document.documentElement)
      const h = root.getPropertyValue('--theme-header-color').trim() || '#ffffff'
      const p = root.getPropertyValue('--color-primary').trim() || '#038ed3'
      setVisuals({ headerBg: h, textColor: getContrastColor(h), primary: p })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  const v = visuals

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    removeAuthCookie('auth_token')
    removeAuthCookie('employee_token')
    router.push('/login')
  }

  const tl = (key: string) => t(key, language)

  const iconBtn = 'w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 shrink-0'

  return (
    <header
      style={{
        backgroundColor: v.headerBg,
        color: v.textColor,
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
      }}
      className="dashboard-header fixed top-0 left-0 right-0 z-[45] h-14"
    >
      <div className="flex items-center justify-between h-full px-3 lg:px-5">
        {/* Right side (RTL): hamburger */}
        <div className="flex items-center gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(true)
              else {
                const { toggleSidebar } = useAppStore.getState()
                toggleSidebar()
              }
            }}
            className={iconBtn}
            style={{ color: v.textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Left side (RTL): actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search — mobile */}
          <button
            suppressHydrationWarning
            onClick={() => setShowSearch(!showSearch)}
            className={`${iconBtn} sm:hidden`}
            style={{ color: v.textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`${iconBtn} hidden sm:flex`}
            style={{ color: v.textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={`${iconBtn} hidden sm:flex`}
            style={{ color: v.textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Messages */}
          <Link
            href="/messages"
            className={`relative ${iconBtn}`}
            style={{ color: v.textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <MessageSquare className="h-4 w-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#dc3545' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* More menu — mobile */}
          <div className="relative sm:hidden" ref={moreRef}>
            <button
              onClick={() => setShowMore(!showMore)}
              className={iconBtn}
              style={{ color: v.textColor }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.08) }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMore && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                <div
                  className="absolute left-0 top-full mt-2 w-48 rounded-xl shadow-lg z-50 py-1 border overflow-hidden"
                  style={{ backgroundColor: v.headerBg, borderColor: hexWithAlpha(v.textColor, 0.1) }}
                >
                  <button
                    onClick={() => { setTheme(theme === 'light' ? 'dark' : 'light'); setShowMore(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full hover:bg-black/5 transition-colors"
                  >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
                  </button>
                  <button
                    onClick={() => { toggleFullscreen(); setShowMore(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full hover:bg-black/5 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                  </button>
                  <Link
                    href="/settings"
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {tl('user.profile')}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setShowMore(false) }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger w-full hover:bg-black/5 transition-colors border-t"
                    style={{ borderColor: hexWithAlpha(v.textColor, 0.08) }}
                  >
                    <LogOut className="h-4 w-4" />
                    {tl('auth.logout')}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div
            className="hidden sm:block w-px h-6 mx-1"
            style={{ backgroundColor: hexWithAlpha(v.textColor, 0.12) }}
          />

          {/* User avatar + name */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full transition-all duration-200"
              style={{ color: v.textColor }}
              onMouseEnter={(e) => { if (!showUserMenu) e.currentTarget.style.backgroundColor = hexWithAlpha(v.textColor, 0.06) }}
              onMouseLeave={(e) => { if (!showUserMenu) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: currentUser?.file_path ? 'transparent' : v.primary, color: '#fff' }}
              >
                {currentUser?.file_path ? (
                  <img src={getImageUrl(currentUser.file_path)} alt="" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:block text-right min-w-0">
                <p className="text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                  {currentUser?.full_name}
                </p>
                <p className="text-[10px] leading-tight" style={{ color: hexWithAlpha(v.textColor, 0.5) }}>
                  {isEmployee ? (employee?.job_title_name || 'موظف') : (user?.role_name || '')}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className="absolute left-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 py-1 border overflow-hidden"
                  style={{ backgroundColor: v.headerBg, borderColor: hexWithAlpha(v.textColor, 0.1) }}
                >
                  <div
                    className="px-4 py-3 border-b"
                    style={{
                      borderColor: hexWithAlpha(v.textColor, 0.08),
                      background: `linear-gradient(135deg, ${hexWithAlpha(v.primary, 0.08)}, transparent)`,
                    }}
                  >
                    <p className="font-medium text-sm">{currentUser?.full_name}</p>
                    <p className="text-xs" style={{ color: hexWithAlpha(v.textColor, 0.5) }}>
                      {isEmployee ? employee?.email : user?.email}
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {tl('user.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger w-full hover:bg-black/5 transition-colors border-t"
                    style={{ borderColor: hexWithAlpha(v.textColor, 0.08) }}
                  >
                    <LogOut className="h-4 w-4" />
                    {tl('auth.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search bar — mobile expandable */}
      {showSearch && (
        <div
          className="sm:hidden absolute top-full left-0 right-0 p-3 border-b"
          style={{
            backgroundColor: v.headerBg,
            borderColor: hexWithAlpha(v.textColor, 0.1),
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div className="relative">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: hexWithAlpha(v.textColor, 0.4) }}
            />
            <input
              suppressHydrationWarning
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tl('common.search') + '...'}
              style={{
                backgroundColor: hexWithAlpha(v.textColor, 0.06),
                color: v.textColor,
              }}
              className="w-full border-0 rounded-xl py-2.5 pr-10 pl-4 text-sm outline-none focus:ring-2 transition-all"
              autoFocus
              onBlur={() => { if (!searchQuery) setShowSearch(false) }}
            />
          </div>
        </div>
      )}
    </header>
  )
}
