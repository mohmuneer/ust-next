'use client'

import { useState, useEffect } from 'react'
import { UserCheck, UserX, Clock, Calendar, Percent, AlertCircle } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { PageErrorWrapper } from '@/components/ui/page-error-wrapper'

export default function AttendancePage() {
  const { student } = useStudentAuthStore()
  const [sessions, setSessions] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    Promise.all([
      studentApi.get<any[]>(`/attendance-records?student_id=${student.id}`),
      studentApi.get<any[]>(`/attendance-sessions`),
    ]).then(([r, s]) => {
      setRecords(r || [])
      setSessions(s || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, student])

  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const late = records.filter((r) => r.status === 'late').length
  const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <PageErrorWrapper>
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الحضور والانصراف</h1>
        <p className="text-gray-500 text-sm">سجل حضور المحاضرات</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">مجموع المحاضرات</p>
          <p className="text-xl font-bold">{total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-500">حاضر</p>
          <p className="text-xl font-bold text-green-600">{present}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-2">
            <UserX className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-500">غائب</p>
          <p className="text-xl font-bold text-red-600">{absent}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <Percent className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-xs text-gray-500">نسبة الحضور</p>
          <p className={`text-xl font-bold ${percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p>
        </div>
      </div>

      {percentage < 75 && total > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">نسبة حضورك أقل من 75%، قد تمنع من دخول الاختبار النهائي</p>
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <UserCheck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد سجلات حضور</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-right p-3 font-medium text-gray-500">#</th>
                  <th className="text-right p-3 font-medium text-gray-500">التاريخ</th>
                  <th className="text-right p-3 font-medium text-gray-500">الحالة</th>
                  <th className="text-right p-3 font-medium text-gray-500">وقت التسجيل</th>
                  <th className="text-right p-3 font-medium text-gray-500">طريقة التحضير</th>
                  <th className="text-right p-3 font-medium text-gray-500">التأخير</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{r.check_in_time?.substring(0, 10) || '---'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'present' ? 'bg-green-100 text-green-700' :
                        r.status === 'late' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : 'غائب'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{r.check_in_time ? r.check_in_time.substring(11, 19) : '---'}</td>
                    <td className="p-3 text-gray-500">{r.check_in_method === 'qr' ? 'QR' : r.check_in_method || 'يدوي'}</td>
                    <td className="p-3 text-gray-500">{r.late_minutes ? `${r.late_minutes} د` : '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </PageErrorWrapper>
  )
}
