'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendanceReportsService, type AttendanceReportData, type StudentAttendanceRate } from '@/services/attendance-reports.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { PieLabelRenderProps } from 'recharts'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import {
  Users, UserCheck, UserX, Clock, FileText, TrendingUp,
  Download, AlertTriangle, Award,
} from 'lucide-react'

const COLORS = {
  present: '#22c55e',
  absent:  '#ef4444',
  late:    '#f59e0b',
  excused: '#6366f1',
}
const PIE_COLORS = [COLORS.present, COLORS.absent, COLORS.late, COLORS.excused]

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function StudentTable({ id, title, icon: Icon, iconColor, data }: { id: string; title: string; icon: React.ElementType; iconColor: string; data: StudentAttendanceRate[] }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table id={id} className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">رقم القيد</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">الاسم</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">الجلسات</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">الحضور</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">النسبة %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-2">{r.student_number}</td>
                  <td className="px-4 py-2">{r.full_name}</td>
                  <td className="px-4 py-2">{r.total}</td>
                  <td className="px-4 py-2">{r.attended}</td>
                  <td className="px-4 py-2">
                    <Badge variant={r.rate >= 75 ? 'success' : r.rate >= 50 ? 'warning' : 'danger'}>
                      {r.rate}%
                    </Badge>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

export default function AttendanceReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useQuery<AttendanceReportData>({
    queryKey: ['attendance-reports', dateFrom, dateTo],
    queryFn: () => attendanceReportsService.getReport({ date_from: dateFrom || undefined, date_to: dateTo || undefined }),
  })

  const d = data

  const statusPieData = d ? [
    { name: 'حاضر', value: d.summary.present },
    { name: 'غائب', value: d.summary.absent },
    { name: 'متأخر', value: d.summary.late },
    { name: 'مستأذن', value: d.summary.excused },
  ] : []

  const subjectBarData = (d?.by_subject || []).map((s) => ({
    name: s.subject_name?.substring(0, 15) || 'غير محدد',
    حاضر: s.present_count,
    غائب: s.absent_count,
    متأخر: s.late_count,
  }))

  const employeeBarData = (d?.by_employee || []).map((e) => ({
    name: e.employee_name?.substring(0, 12) || 'غير محدد',
    جلسات: e.session_count,
    حاضر: e.present_count,
    غائب: e.absent_count,
  }))

  const trendData = (d?.daily_trend || []).map((t) => ({
    date: t.date,
    حاضر: t.present_count,
    غائب: t.absent_count,
    متأخر: t.late_count,
  }))

  const methodPieData = (d?.by_method || []).map((m) => ({
    name: m.method === 'qr' ? 'QR' : m.method === 'manual' ? 'يدوي' : m.method || 'غير معروف',
    value: m.count,
  }))

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقارير الحضور والانصراف"
        description="إحصائيات وتقارير شاملة للحضور"
        actions={
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            طباعة / تصدير
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">من تاريخ:</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">إلى تاريخ:</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo('') }}>
                مسح الفلتر
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card><CardBody><p className="text-center py-10 text-muted-foreground">جاري التحميل...</p></CardBody></Card>
      ) : d ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <SummaryCard icon={FileText} label="إجمالي الجلسات" value={d.summary.total_sessions} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
            <SummaryCard icon={Users} label="إجمالي السجلات" value={d.summary.total_records} color="bg-gray-100 text-gray-600 dark:bg-gray-900/30" />
            <SummaryCard icon={UserCheck} label="حاضر" value={d.summary.present} color="bg-green-100 text-green-600 dark:bg-green-900/30" />
            <SummaryCard icon={UserX} label="غائب" value={d.summary.absent} color="bg-red-100 text-red-600 dark:bg-red-900/30" />
            <SummaryCard icon={Clock} label="متأخر" value={d.summary.late} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30" />
            <SummaryCard icon={TrendingUp} label="نسبة الحضور" value={`${d.summary.attendance_rate}%`} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" />
          </div>

          {/* Charts Row 1: Status Pie + Daily Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">توزيع الحالات</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">الاتجاه اليومي</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="حاضر" stroke={COLORS.present} strokeWidth={2} />
                    <Line type="monotone" dataKey="غائب" stroke={COLORS.absent} strokeWidth={2} />
                    <Line type="monotone" dataKey="متأخر" stroke={COLORS.late} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 2: Subject Bar + Method Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">الحضور حسب المادة</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="حاضر" fill={COLORS.present} />
                    <Bar dataKey="غائب" fill={COLORS.absent} />
                    <Bar dataKey="متأخر" fill={COLORS.late} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">طريقة التسجيل</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={methodPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                      {methodPieData.map((_, i) => <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#6b7280'][i] || '#6b7280'} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 3: Employee bar */}
          {employeeBarData.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">الحضور حسب المحاضر</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="جلسات" fill="#3b82f6" />
                    <Bar dataKey="حاضر" fill={COLORS.present} />
                    <Bar dataKey="غائب" fill={COLORS.absent} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* Tables: Top & Worst Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentTable
              id="top-students-table"
              title="أفضل نسبة حضور"
              icon={Award}
              iconColor="text-green-600"
              data={d.top_students}
            />
            <StudentTable
              id="worst-students-table"
              title="أدنى نسبة حضور"
              icon={AlertTriangle}
              iconColor="text-red-600"
              data={d.worst_students}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
