'use client'
import { createContext, useContext } from 'react'
import { useStudentNotifications } from '@/hooks/use-student-notifications'

interface NotificationBadgeContextType {
  unreadCount: number
  loading: boolean
  refresh: () => void
}

const NotificationBadgeContext = createContext<NotificationBadgeContextType>({
  unreadCount: 0,
  loading: true,
  refresh: () => {},
})

export function useNotificationBadge() {
  return useContext(NotificationBadgeContext)
}

export function NotificationBadgeProvider({ children }: { children: React.ReactNode }) {
  const { count, loading, refresh } = useStudentNotifications(30000)

  return (
    <NotificationBadgeContext.Provider value={{ unreadCount: count, loading, refresh }}>
      {children}
    </NotificationBadgeContext.Provider>
  )
}
