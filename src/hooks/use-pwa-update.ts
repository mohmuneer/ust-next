'use client'
import { useState, useEffect, useCallback } from 'react'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  newVersion: string | null
  updateSW: () => Promise<void>
  dismiss: () => void
}

export function usePWAUpdate(): UpdateInfo {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [currentVersion, setCurrentVersion] = useState('')
  const [newVersion, setNewVersion] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.serviceWorker?.controller) return

    const channel = new MessageChannel()
    channel.port1.onmessage = (e) => {
      setCurrentVersion(e.data.version || 'unknown')
    }
    navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' }, [channel.port2])

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller?.scriptURL) {
        window.location.reload()
      }
    })
  }, [])

  useEffect(() => {
    if (!navigator.serviceWorker) return

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setHasUpdate(true)
        setNewVersion('available')
      }
    }

    navigator.serviceWorker.ready.then(handleUpdate)

    navigator.serviceWorker.addEventListener('updatefound', () => {
      navigator.serviceWorker.ready.then(handleUpdate)
    })
  }, [])

  const updateSW = useCallback(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setHasUpdate(false)
    }
  }, [])

  const dismiss = useCallback(() => {
    setHasUpdate(false)
  }, [])

  return { hasUpdate, currentVersion, newVersion, updateSW, dismiss }
}
