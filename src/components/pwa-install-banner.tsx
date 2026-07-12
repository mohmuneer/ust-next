'use client'

import { usePWAInstall } from '@/hooks/use-pwa-install'
import { X, Download, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PWAInstallBannerProps {
  variant?: 'student' | 'employee'
}

export function PWAInstallBanner({ variant = 'student' }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, isIOS, install, dismiss, wasDismissed } = usePWAInstall()
  const [showBanner, setShowBanner] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    if (isInstalled) return

    if (isIOS && !wasDismissed()) {
      setShowIOS(true)
      return
    }

    if (isInstallable && !wasDismissed()) {
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled, isIOS, wasDismissed])

  const handleInstall = async () => {
    await install()
    setShowBanner(false)
  }

  const handleDismiss = () => {
    dismiss()
    setShowBanner(false)
    setShowIOS(false)
  }

  if (isInstalled) return null

  const colors = variant === 'student'
    ? { bg: 'from-[#038ed3] to-[#025a87]', text: 'text-white' }
    : { bg: 'from-[#025a87] to-[#038ed3]', text: 'text-white' }

  const title = variant === 'student'
    ? 'تثبيت بوابة الطالب'
    : 'تثبيت لوحة التحكم'

  const description = variant === 'student'
    ? 'أضف بوابة الطالب إلى شاشة الرئيسية للوصول السريع لجميع خدماتك الدراسية'
    : 'أضف لوحة التحكم إلى شاشة الرئيسية لإدارة المنظومة بسهولة'

  if (showIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md">
        <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl shadow-2xl p-4 ${colors.text}`}>
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-xl shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-1">{title}</h3>
              <p className="text-xs opacity-90 mb-2 leading-relaxed">{description}</p>
              <div className="bg-white/10 rounded-lg p-2 text-xs">
                <p className="font-semibold mb-1">خطوات التثبيت على iPhone/iPad:</p>
                <ol className="space-y-1 opacity-90">
                  <li>1. اضغط على زر المشاركة (📤) في شريط الأدوات</li>
                  <li>2. اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</li>
                  <li>3. اضغط &quot;إضافة&quot; للتأكيد</li>
                </ol>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white shrink-0 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md animate-in slide-in-from-bottom-5 duration-500">
      <div className={`bg-gradient-to-r ${colors.bg} rounded-2xl shadow-2xl p-4 ${colors.text}`}>
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">{title}</h3>
            <p className="text-xs opacity-90 mb-3 leading-relaxed">{description}</p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-[#038ed3] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                تثبيت الآن
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/10 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-white/20 transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white shrink-0 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
