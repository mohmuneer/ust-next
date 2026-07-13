'use client'
import { usePWAUpdate } from '@/hooks/use-pwa-update'
import { Download, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function PWAUpdateBanner() {
  const { hasUpdate, updateSW, dismiss } = usePWAUpdate()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (hasUpdate) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasUpdate])

  if (!show) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9998] max-w-md mx-auto" dir="rtl">
      <div className="bg-gradient-to-l from-primary to-blue-600 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">تحديث متاح</p>
          <p className="text-xs text-white/80">يوجد تحديث جديد للتطبيق</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => { updateSW(); setShow(false) }} className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
            تحديث
          </button>
          <button onClick={() => setShow(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
