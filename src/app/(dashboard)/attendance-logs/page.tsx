'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { attendanceLogsService } from '@/services/attendance-logs.service'
import { attendanceSessionsService } from '@/services/attendance-sessions.service'
import { CheckCircle2, XCircle, Clock, Filter, Download } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { AttendanceLog } from '@/types'

export default function AttendanceLogsPage() {
  const [sessionId, setSessionId] = useState<number>(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: sessions } = useQuery({
    queryKey: ['attendance-sessions'],
    queryFn: () => attendanceSessionsService.getAll(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-logs', sessionId, statusFilter, page],
    queryFn: () => attendanceLogsService.getAll({
      session_id: sessionId || undefined,
      status: statusFilter || undefined,
      page,
      per_page: 50,
    }),
  })

  const logs = data?.data || []
  const total = data?.total || 0

  const columns: Column<AttendanceLog>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_name', label: 'الطالب' },
    { key: 'student_number', label: 'الرقم' },
    { key: 'action', label: 'الإجراء', render: (l) => (
      <span className="text-xs">{l.action === 'scan' ? 'مسح QR' : l.action === 'manual' ? 'تحضير يدوي' : l.action}</span>
    )},
    { key: 'status', label: 'الحالة', render: (l) => (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        l.status === 'accepted' ? 'bg-green-100 text-green-700' :
        l.status === 'rejected' ? 'bg-red-100 text-red-700' :
        l.status === 'present' ? 'bg-green-100 text-green-700' :
        l.status === 'late' ? 'bg-amber-100 text-amber-700' :
        l.status === 'absent' ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {l.status === 'accepted' ? 'مقبول' :
         l.status === 'rejected' ? 'مرفوض' :
         l.status === 'present' ? 'حاضر' :
         l.status === 'late' ? 'متأخر' :
         l.status === 'absent' ? 'غائب' : l.status}
      </span>
    )},
    { key: 'message', label: 'الرسالة', render: (l) => (
      <span className="text-xs text-gray-500 max-w-[200px] truncate block">{l.message || '---'}</span>
    )},
    { key: 'distance_meters', label: 'المسافة', render: (l) => (
      <span className="text-xs">{l.distance_meters != null ? `${l.distance_meters}م` : '---'}</span>
    )},
    { key: 'session_date', label: 'التاريخ' },
    { key: 'created_at', label: 'وقت التسجيل', sortable: true, render: (l) => formatDateTime(l.created_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجلات المحاولات"
        description="مراقبة جميع محاولات التحضير (مقبولة ومرفوضة)"
      />

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">الجلسة</label>
              <SearchableSelect
                value={sessionId}
                onChange={(v) => { setSessionId(Number(v)); setPage(1) }}
                options={[
                  { value: 0, label: 'جميع الجلسات' },
                  ...(sessions || []).map((s: any) => ({ value: s.id, label: `${s.subject_name || 'جلسة'} - ${s.session_date?.substring(0, 10)}` })),
                ]}
                searchPlaceholder="بحث..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
              >
                <option value="">الكل</option>
                <option value="accepted">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-xs text-gray-400">النتائج: {total}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={logs}
            searchable
            searchPlaceholder="بحث في السجلات..."
            id="attendance-logs-table"
            emptyMessage="لا توجد سجلات محاولات"
          />
          {total > 50 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                السابق
              </Button>
              <span className="text-sm text-gray-500">صفحة {page} / {Math.ceil(total / 50)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}>
                التالي
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
