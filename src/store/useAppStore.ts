import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SidebarMenuItem, SystemSettings, SystemVisuals } from '@/types'

interface AppState {
  language: 'ar' | 'en'
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  mobileOpen: boolean
  sidebarMenu: SidebarMenuItem[]
  systemSettings: SystemSettings | null
  systemVisuals: SystemVisuals | null
  setLanguage: (lang: 'ar' | 'en') => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
  setSidebarMenu: (menu: SidebarMenuItem[]) => void
  setSystemSettings: (settings: SystemSettings) => void
  setSystemVisuals: (visuals: SystemVisuals) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ar',
      theme: 'light',
      sidebarCollapsed: false,
      mobileOpen: false,
      sidebarMenu: [],
      systemSettings: null,
      systemVisuals: null,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
      toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
      setSidebarMenu: (sidebarMenu) => set({ sidebarMenu }),
      setSystemSettings: (systemSettings) => set({ systemSettings }),
      setSystemVisuals: (systemVisuals) => set({ systemVisuals }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
