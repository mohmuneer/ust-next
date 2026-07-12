'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Save, CheckCircle2, XCircle, Clock, AlertTriangle, UserCheck, UserX, Users, ClipboardList } from 'lucide-react'
import { attendanceSessionsService } from '@/services/attendance-sessions.service'
import { sessionStudentsService, type SessionStudent } from '@/services/session-students.service'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; bg: string; icon: any }[] = [
  { value: 'present', label: 'حاضر', color: 'text-green-700', bg: 'bg-green-100 border-green-300', icon: CheckCircle2 },
  { value: 'absent', label: 'غائب', color: 'text-red-700', bg: 'bg-red-100 border-red-300', icon: XCircle },
  { value: 'late', label: 'متأخر', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-300', icon: Clock },
  { value: 'excused', label: 'مستأذن', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300', icon: AlertTriangle },
]

export default function ManualAttendancePage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<number>(0)
  const [students, setStudents] = useState<SessionStudent[]>([])
  const [marks, setMarks] = useState<Record<number, { status: AttendanceStatus; late_minutes: number; notes: string }>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    attendanceSessionsService.getAll().then((s) => setSessions(s || []))
  }, [])

  useEffect(() => {
    if (!selectedSessionId) { setStudents([]); setMarks({}); return }
    setLoading(true)
    sessionStudentsService.getBySession(selectedSessionId).then((data) => {
      setStudents(data)
      const initial: Record<number, { status: AttendanceStatus; late_minutes: number; notes: string }> = {}
      data.forEach((s) => {
        initial[s.id] = {
          status: (s.attendance_status as AttendanceStatus) || 'present',
          late_minutes: s.late_minutes || 0,
          notes: '',
        }
      })
      setMarks(initial)
      setLoading(false)
    })
  }, [selectedSessionId])

  const handleMark = (studentId: number, status: AttendanceStatus) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const handleBulkMark = (status: AttendanceStatus) => {
    const updated = { ...marks }
    filteredStudents.forEach((s) => {
      updated[s.id] = { ...updated[s.id], status }
    })
    setMarks(updated)
  }

  const handleSave = async () => {
    if (!selectedSessionId || !user) return
    setSaving(true)
    setResult(null)
    try {
      const records = Object.entries(marks).map(([studentId, m]) => ({
        student_id: Number(studentId),
        status: m.status,
        late_minutes: m.status === 'late' ? m.late_minutes : 0,
        notes: m.notes,
      }))
      const res = await sessionStudentsService.submitManualAttendance({
        session_id: selectedSessionId,
        employee_id: (user as any)?.employee_id || user?.id || 0,
        records,
      })
      setResult({ success: true, message: res.message || 'تم حفظ التحضير بنجاح' })
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'خطأ في الحفظ' })
    }
    setSaving(false)
  }

  const filteredStudents = students.filter((s) =>
    !search || s.full_name.includes(search) || s.student_number?.includes(search)
  )

  const presentCount = Object.values(marks).filter((m) => m.status === 'present').length
  const absentCount = Object.values(marks).filter((m) => m.status === 'absent').length
  const lateCount = Object.values(marks).filter((m) => m.status === 'late').length
  const excusedCount = Object.values(marks).filter((m) => m.status === 'excused').length

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="تحضير يدوي"
        description="تسجيل حضور الطلاب يدوياً"
        actions={
          selectedSessionId > 0 ? (
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="h-4 w-4 ml-1" /> {saving ? 'جاري الحفظ...' : 'حفظ التحضير'}
            </Button>
          ) : undefined
        }
      />

      {result && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
          <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
        </div>
      )}

      {/* Session Selection */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">اختر المحاضرة/الجلسة</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
              >
                <option value={0}>اختر جلسة...</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject_name || `جلسة ${s.id}`} - {s.session_date?.substring(0, 10)} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedSession && (
            <div className="mt-3 text-xs text-gray-500">
              {selectedSession.subject_name} | {selectedSession.session_date?.substring(0, 10)} | {selectedSession.start_time} - {selectedSession.end_time}
            </div>
          )}
        </CardBody>
      </Card>

      {selectedSessionId > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{students.length}</p>
              <p className="text-[10px] text-gray-400">الكل</p>
            </div>
            {STATUS_OPTIONS.map((opt) => {
              const count = Object.values(marks).filter((m) => m.status === opt.value).length
              return (
                <div key={opt.value} className="bg-white rounded-xl border border-gray-100 p-3 text-center cursor-pointer hover:border-primary/30" onClick={() => handleBulkMark(opt.value)}>
                  <opt.icon className={`h-5 w-5 mx-auto mb-1 ${opt.color}`} />
                  <p className={`text-lg font-bold ${opt.color}`}>{count}</p>
                  <p className="text-[10px] text-gray-400">{opt.label}</p>
                </div>
              )
            })}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          {/* Student List */}
          <Card>
            <CardBody>
              {loading ? (
                <div className="text-center py-12 text-gray-400">جاري تحميل الطلاب...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400">لا يوجد طالب مسجلين في هذه المادة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{student.full_name}</p>
                        <p className="text-xs text-gray-400">{student.student_number}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((opt) => {
                          const isActive = marks[student.id]?.status === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleMark(student.id, opt.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isActive
                                  ? `${opt.bg} ${opt.color}`
                                  : 'border-gray-200 text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Save button at bottom */}
          {filteredStudents.length > 0 && (
            <div className="sticky bottom-4 flex justify-center">
              <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
                <Save className="h-4 w-4 ml-1" /> {saving ? 'جاري الحفظ...' : `حفظ التحضير (${filteredStudents.length} طالب)`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
