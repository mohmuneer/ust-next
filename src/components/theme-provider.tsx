'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { systemService, type SystemVisualsData } from '@/services/system.service'
import { useAppStore } from '@/store/useAppStore'

const DEFAULTS: SystemVisualsData = {
  id: 1,
  system_font: 'Cairo',
  sidebar_color: '#343a40',
  header_color: '#ffffff',
  main_color: '#007bff',
  add_btn_color: '#28a745',
  print_btn_color: '#17a2b8',
  delete_btn_color: '#dc3545',
  card_color: '#007bff',
}

function getContrastColor(hex: string): string {
  if (!hex || hex.length < 6) return '#000000'
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#1a1a2e' : '#ffffff'
}

function sanitizeCSS(value: string | undefined | null, fallback: string): string {
  if (!value || value === 'undefined' || value === 'null') return fallback
  return value
}

function ensureHash(value: string): string {
  if (!value || value === 'undefined' || value === 'null') return '#000000'
  return value.startsWith('#') ? value : `#${value}`
}

function darkenColor(hex: string, amount: number): string {
  if (!hex || hex.length < 6) return '#1e293b'
  const c = hex.replace('#', '')
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function applyThemeStyles(visuals: SystemVisualsData | null) {
  if (typeof document === 'undefined') return

  const raw = Array.isArray(visuals) ? visuals[0] || {} : visuals || {}
  const v = { ...DEFAULTS, ...raw } as SystemVisualsData

  const root = document.documentElement

  const sidebarColor = sanitizeCSS(v.sidebar_color, '#343a40')
  const headerColor = sanitizeCSS(v.header_color, '#ffffff')
  const mainColor = sanitizeCSS(v.main_color, '#007bff')
  const addBtnColor = sanitizeCSS(v.add_btn_color, '#28a745')
  const printBtnColor = sanitizeCSS(v.print_btn_color, '#17a2b8')
  const deleteBtnColor = sanitizeCSS(v.delete_btn_color, '#dc3545')
  const cardColor = sanitizeCSS(v.card_color, '#007bff')
  const font = sanitizeCSS(v.system_font, 'Cairo')

  const headerTextColor = getContrastColor(headerColor)
  const sidebarTextColor = getContrastColor(sidebarColor)
  const sidebarActiveColor = mainColor
  const sidebarHoverColor = darkenColor(sidebarColor, 30)

  root.style.setProperty('--theme-sidebar-color', sidebarColor)
  root.style.setProperty('--theme-sidebar-text', sidebarTextColor)
  root.style.setProperty('--theme-sidebar-hover', sidebarHoverColor)
  root.style.setProperty('--theme-sidebar-active', sidebarActiveColor)
  root.style.setProperty('--theme-header-color', headerColor)
  root.style.setProperty('--theme-header-text', headerTextColor)
  root.style.setProperty('--theme-card-border-color', cardColor)

  let styleEl = document.getElementById('theme-vars')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'theme-vars'
    document.head.appendChild(styleEl)
  }

  const sidebarActiveTextColor = getContrastColor(sidebarActiveColor)

  styleEl.textContent = `
    :root {
      --color-primary: ${mainColor};
      --color-success: ${addBtnColor};
      --color-info: ${printBtnColor};
      --color-danger: ${deleteBtnColor};
      --theme-sidebar-color: ${sidebarColor};
      --theme-sidebar-text: ${sidebarTextColor};
      --theme-sidebar-hover: ${sidebarHoverColor};
      --theme-sidebar-active: ${sidebarActiveColor};
      --theme-sidebar-active-text: ${sidebarActiveTextColor};
      --theme-header-color: ${headerColor};
      --theme-header-text: ${headerTextColor};
      --theme-card-border-color: ${cardColor};
    }
    body { font-family: ${font}, 'Tajawal', sans-serif !important; }
  `

  const fontId = `gf-${font.replace(/\s+/g, '-')}`
  if (!document.getElementById(fontId)) {
    try {
      const link = document.createElement('link')
      link.id = fontId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`
      link.onerror = () => { link.remove() }
      document.head.appendChild(link)
    } catch {}
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ['system-visuals'],
    queryFn: () => systemService.getVisuals(),
    staleTime: 5 * 60 * 1000,
  })

  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    applyThemeStyles(data as SystemVisualsData | null)
  }, [data])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [theme])

  return <>{children}</>
}
