'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

interface NotificationState {
  count: number
  loading: boolean
  refresh: () => void
}

export function useStudentNotifications(pollInterval = 30000): NotificationState {
  const { student, token } = useStudentAuthStore()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchCount = useCallback(async () => {
    if (!student?.id) return
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/student-notifications-unread?student_id=${student.id}`, { headers })
      const data = await res.json()
      if (mountedRef.current) {
        setCount(data.count || 0)
        setLoading(false)
      }
    } catch {
      if (mountedRef.current) setLoading(false)
    }
  }, [student?.id, token])

  useEffect(() => {
    mountedRef.current = true
    fetchCount()

    intervalRef.current = setInterval(fetchCount, pollInterval)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchCount, pollInterval])

  return { count, loading, refresh: fetchCount }
}
