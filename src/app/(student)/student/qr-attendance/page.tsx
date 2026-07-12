'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QrCode, Camera, CameraOff, CheckCircle2, XCircle, MapPin, Smartphone, Shield, Clock, AlertTriangle, Navigation } from 'lucide-react'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { studentApi } from '@/services/student-api'

export default function QrAttendancePage() {
  const { student } = useStudentAuthStore()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; distance?: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [qrData, setQrData] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [deviceId] = useState(() => 'web_' + Math.random().toString(36).substring(2, 10))
  const [gps, setGps] = useState<{ lat?: number; lng?: number }>({})
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'granted' | 'denied' | 'unavailable'>('loading')

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('granted')
      },
      (err) => {
        setGpsStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    )
  }, [])

  const startCamera = useCallback(async () => {
    if (gpsStatus !== 'granted') {
      setResult({ success: false, message: 'يجب تفعيل خدمة الموقع أولاً لتسجيل الحضور' })
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
      setResult(null)
    } catch {
      setResult({ success: false, message: 'تعذر الوصول إلى الكاميرا' })
    }
  }, [gpsStatus])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  useEffect(() => () => { stopCamera() }, [stopCamera])

  const handleScan = async (token: string) => {
    if (!token.trim() || !gps.lat || !gps.lng) return
    setLoading(true)
    setResult(null)
    try {
      const res = await studentApi.post<any>('/attendance-scan', {
        token: token.trim(),
        student_id: student?.id,
        device_id: deviceId,
        latitude: gps.lat,
        longitude: gps.lng,
      })
      setResult({ success: true, message: res.message || 'تم تسجيل الحضور بنجاح', distance: res.distance })
    } catch (err: any) {
      const msg = err.message || 'فشل تسجيل الحضور'
      setResult({ success: false, message: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (!qrData.trim()) return
    handleScan(qrData.trim())
  }

  if (!student) return null

  const gpsGranted = gpsStatus === 'granted'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">حضور QR</h1>
        <p className="text-gray-500 text-sm">امسح رمز QR الخاص بالمحاضرة لتسجيل الحضور</p>
      </div>

      {/* GPS Status Banner */}
      <div className={`rounded-xl p-3 flex items-center gap-3 text-sm ${
        gpsGranted ? 'bg-green-50 border border-green-200' :
        gpsStatus === 'loading' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <Navigation className={`h-4 w-4 shrink-0 ${
          gpsGranted ? 'text-green-500' :
          gpsStatus === 'loading' ? 'text-yellow-500 animate-pulse' :
          'text-red-500'
        }`} />
        <div className="flex-1">
          {gpsStatus === 'loading' && <span className="text-yellow-700">جاري تحديد الموقع...</span>}
          {gpsStatus === 'granted' && (
            <span className="text-green-700">
              الموقع مفعل: {gps.lat?.toFixed(5)}, {gps.lng?.toFixed(5)}
            </span>
          )}
          {gpsStatus === 'denied' && <span className="text-red-700">تم رفض صلاحية الموقع. لا يمكن التحضير عبر QR بدون GPS.</span>}
          {gpsStatus === 'unavailable' && <span className="text-red-700">خدمة الموقع غير متاحة على جهازك.</span>}
        </div>
      </div>

      {gpsStatus === 'denied' || gpsStatus === 'unavailable' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-3" />
          <p className="font-bold text-amber-700 mb-2">خدمة الموقع غير متاحة</p>
          <p className="text-sm text-amber-600 mb-4">يجب تفعيل GPS على جهازك والموافقة على صلاحية الموقع لتسجيل الحضور عبر QR.</p>
          <p className="text-xs text-amber-500">يرجى طلب التحضير اليدوي من المدرس.</p>
        </div>
      ) : (
        <>
          {/* Result */}
          {result && (
            <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {result.success ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
                {result.distance !== undefined && result.distance !== null && (
                  <p className="text-xs text-green-600 mt-1">المسافة من القاعة: {result.distance} متر</p>
                )}
              </div>
            </div>
          )}

          {/* QR Scanner */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            {scanning ? (
              <div className="space-y-4">
                <div className="relative w-64 h-64 mx-auto bg-black rounded-2xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-[3px] border-dashed border-primary/50 rounded-2xl" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                      المسافة: {gps.lat?.toFixed(4)}, {gps.lng?.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button onClick={stopCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm">
                  <CameraOff className="h-4 w-4" /> إيقاف الكاميرا
                </button>
                <p className="text-xs text-gray-400">وجه الكاميرا نحو رمز QR الخاص بالمحاضرة</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-primary" />
                </div>
                <button onClick={startCamera}
                  disabled={!gpsGranted}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Camera className="h-5 w-5" /> فتح الكاميرا
                </button>
                {!gpsGranted && <p className="text-xs text-red-500">يجب تفعيل الموقع أولاً</p>}
                <p className="text-xs text-gray-400">أو</p>
                <button onClick={() => setManualMode(!manualMode)}
                  className="text-sm text-primary hover:underline">
                  {manualMode ? 'إلغاء' : 'إدخال رمز يدويًا'}
                </button>
              </div>
            )}
          </div>

          {/* Manual QR Input */}
          {manualMode && !scanning && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-sm">إدخال رمز QR يدويًا</h3>
              <textarea value={qrData} onChange={(e) => setQrData(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm font-mono h-24 focus:outline-none focus:ring-2 focus:ring-primary/50" dir="ltr"
                placeholder="ألصق رمز QR هنا..." />
              <button onClick={handleManualSubmit} disabled={loading || !qrData.trim() || !gpsGranted}
                className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50">
                {loading ? 'جاري التحقق...' : 'تأكيد الحضور'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Security Info */}
      <div className="bg-white/60 rounded-2xl border border-dashed border-gray-200 p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> طبقات الأمان
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-gray-400">صلاحية QR</p>
              <p className="font-medium text-gray-600">تنتهي تلقائياً</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-gray-400">الموقع</p>
              <p className="font-medium text-gray-600">{gpsGranted ? 'مفعل' : 'غير متاح'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-gray-400">الجهاز</p>
              <p className="font-medium text-gray-600">{deviceId.substring(0, 12)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-gray-400">النطاق</p>
              <p className="font-medium text-gray-600">حسب القاعة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
