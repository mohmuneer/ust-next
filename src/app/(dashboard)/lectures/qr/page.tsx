'use client'

import { useState, useEffect, useCallback } from 'react'
import { QrCode, RefreshCw, Clock, MapPin, Users, Play, StopCircle, CheckCircle2, Settings, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LectureQRPage() {
  const { user } = useAuthStore()
  const [lectures, setLectures] = useState<any[]>([])
  const [selectedLecture, setSelectedLecture] = useState<any>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [qrData, setQrData] = useState<any>(null)
  const [countdown, setCountdown] = useState(30)
  const [qrRotation, setQrRotation] = useState(30)
  const [attendees, setAttendees] = useState<any[]>([])
  const [gps, setGps] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetch('/api/lectures')
      .then((r) => r.json())
      .then((d) => {
        const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
        const filtered = (d || []).filter((l: any) => l.status === 'scheduled' && l.day_of_week === today)
        setLectures(filtered)
      })
      .catch(() => {})

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  const generateQR = useCallback(async () => {
    if (!selectedLecture) return
    setLoading(true)
    try {
      const res = await fetch('/api/lecture-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecture_id: selectedLecture.id,
          employee_id: (user as any)?.employee_id || user?.id,
          study_subject_id: selectedLecture.study_subject_id,
          latitude: gps.lat,
          longitude: gps.lng,
          qr_rotation: qrRotation,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setQrData(data)
        setSessionActive(true)
        setCountdown(qrRotation)
      }
    } catch {}
    setLoading(false)
  }, [selectedLecture, user, gps, qrRotation])

  useEffect(() => {
    if (!sessionActive) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateQR()
          return qrRotation
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionActive, generateQR, qrRotation])

  useEffect(() => {
    if (!qrData?.session_id) return
    const interval = setInterval(() => {
      fetch(`/api/attendance-records?attendance_session_id=${qrData.session_id}`)
        .then((r) => r.json())
        .then((d) => setAttendees(d || []))
        .catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [qrData?.session_id])

  const stopSession = () => {
    setSessionActive(false)
    setQrData(null)
    setAttendees([])
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حضور QR للمحاضرات</h1>
          <p className="text-gray-500 text-sm">إدارة حضور الطلاب عبر رمز QR مع التحقق من الموقع</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/lectures/attendance">
            <Button variant="outline" size="sm">
              <ClipboardList className="h-4 w-4 ml-1" /> تحضير يدوي
            </Button>
          </Link>
          {sessionActive ? (
            <Button variant="danger" onClick={stopSession}><StopCircle className="h-4 w-4 ml-1" /> إنهاء الجلسة</Button>
          ) : (
            <Button onClick={generateQR} disabled={!selectedLecture || loading}>
              <Play className="h-4 w-4 ml-1" /> {loading ? 'جاري التحميل...' : 'بدء المحاضرة'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lecture selection & settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-sm mb-3">اختر المحاضرة</h2>
            {lectures.length === 0 ? (
              <p className="text-sm text-gray-400">لا توجد محاضرات اليوم</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lectures.map((l) => (
                  <button key={l.id} onClick={() => { setSelectedLecture(l); stopSession() }}
                    className={`w-full p-3 rounded-xl text-right border transition-all ${
                      selectedLecture?.id === l.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-gray-100 hover:border-primary/30'
                    }`}
                  >
                    <p className="font-medium text-sm">{l.subject_name || `محاضرة ${l.id}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.room_name || l.room ? `قاعة ${l.room_name || l.room}` : ''} | {l.start_time?.substring(0, 5)} - {l.end_time?.substring(0, 5)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QR Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" /> إعدادات QR
              </h2>
              <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-primary hover:underline">
                {showSettings ? 'إخفاء' : 'تعديل'}
              </button>
            </div>
            {showSettings ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">فترة التحديث (ثانية)</label>
                  <select
                    value={qrRotation}
                    onChange={(e) => setQrRotation(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                    disabled={sessionActive}
                  >
                    <option value={30}>30 ثانية (الأكثر أماناً)</option>
                    <option value={60}>60 ثانية</option>
                    <option value={120}>دقيقتان</option>
                    <option value={300}>5 دقائق</option>
                  </select>
                  {sessionActive && <p className="text-[10px] text-gray-400 mt-1">لا يمكن التغيير أثناء الجلسة النشطة</p>}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                <p>فترة التحديث: {qrRotation} ثانية</p>
              </div>
            )}
          </div>

          {/* Session Stats */}
          {sessionActive && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-sm mb-3">الإحصائيات</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">الحاضرون</span>
                  <span className="font-bold text-green-600">{attendees.filter((a) => a.status === 'present').length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">المتأخرون</span>
                  <span className="font-bold text-amber-600">{attendees.filter((a) => a.status === 'late').length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">المجموع</span>
                  <span className="font-bold">{attendees.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Room Geofencing Info */}
          {qrData?.room && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h2 className="font-bold text-sm mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" /> معلومات القاعة
              </h2>
              <div className="text-xs text-blue-700 space-y-1">
                <p>خط العرض: {qrData.room.latitude?.toFixed(6) || 'غير محدد'}</p>
                <p>خط الطول: {qrData.room.longitude?.toFixed(6) || 'غير محدد'}</p>
                <p>نطاق التحقق: {qrData.room.radius} متر</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: QR Code */}
        <div className="lg:col-span-2">
          {!sessionActive ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <QrCode className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-bold mb-2">QR غير نشط</h2>
              <p className="text-sm text-gray-400 mb-4">اختر محاضرة ثم اضغط "بدء المحاضرة" لتوليد رمز QR</p>
              {selectedLecture && (
                <div className="text-right bg-gray-50 rounded-xl p-4 max-w-sm mx-auto">
                  <p className="font-medium text-sm">{selectedLecture.subject_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{selectedLecture.room_name || selectedLecture.room} | {selectedLecture.start_time?.substring(0, 5)} - {selectedLecture.end_time?.substring(0, 5)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <MapPin className="h-3 w-3 inline ml-1" />
                    {gps.lat ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : 'جلب الموقع...'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> الجلسة نشطة
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" /> تجدد خلال {countdown} ثانية
                </div>
              </div>

              {/* QR Display */}
              <div className="w-64 h-64 mx-auto bg-white rounded-2xl border-2 border-dashed border-primary/30 p-4 flex items-center justify-center mb-4">
                {qrData?.qr_token ? (
                  <div className="text-center">
                    <QrCode className="h-48 w-48 mx-auto text-primary" />
                    <p className="text-[10px] text-gray-300 mt-2 font-mono truncate max-w-[200px] mx-auto">{qrData.qr_token.substring(0, 40)}...</p>
                  </div>
                ) : (
                  <RefreshCw className="h-12 w-12 text-gray-300 animate-spin" />
                )}
              </div>

              <p className="text-xs text-gray-400 mb-4">
                <RefreshCw className="h-3 w-3 inline ml-1 animate-spin" />
                يتجدد QR تلقائياً كل {qrRotation} ثانية
              </p>

              <button onClick={generateQR} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <RefreshCw className="h-4 w-4" /> توليد رمز جديد
              </button>

              {/* Recent attendees */}
              {attendees.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> آخر الحاضرين
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {attendees.slice(-10).reverse().map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 text-sm">
                        <span className="text-gray-700">{a.student_name || `طالب ${a.student_id}`}</span>
                        <div className="flex items-center gap-2">
                          {a.distance_meters && (
                            <span className="text-[10px] text-gray-400">{a.distance_meters}م</span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            a.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {a.check_in_time?.substring(11, 19) || '---'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
