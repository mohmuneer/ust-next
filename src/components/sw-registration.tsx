'use client'

import { useEffect } from 'react'

interface SWRegistrationProps {
  manifestPath: string
}

export function SWRegistration({ manifestPath }: SWRegistrationProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})

      const existing = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
      if (existing) {
        existing.href = manifestPath
      } else {
        const link = document.createElement('link')
        link.rel = 'manifest'
        link.href = manifestPath
        document.head.appendChild(link)
      }
    }
  }, [manifestPath])

  return null
}
