'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestsService } from '@/services/requests.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, Clock, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react'
import type { Request } from '@/types'
import { getStatusColor, getStatusText, getPriorityColor, formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'

const statusTabs = [
  { key: 'all', label: 'الكل', icon: Clock },
  { key: 'Pending', label: 'معلق', icon: Clock },
  { key: 'In Progress', label: 'قيد التنفيذ', icon: AlertTriangle },
  { key: 'Resolved', label: 'تم الحل', icon: CheckCircle },
  { key: 'Cancelled', label: 'ملغي', icon: XCircle },
]

export default function RequestReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestsService.getAll(),
  })

  const stats = useMemo(() => {
    if (!requests) return { total: 0, pending: 0, inProgress: 0, resolved: 0, cancelled: 0 }
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      resolved: requests.filter(r => r.status === 'Resolved').length,
      cancelled: requests.filter(r => r.status === 'Cancelled').length,
    }
  }, [requests])

  const filtered = useMemo(() => {
    if (!requests) return []
    let result = [...requests]
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    if (dateFrom) result = result.filter(r => new Date(r.created_at) >= new Date(dateFrom))
    if (dateTo) result = result.filter(r => new Date(r.created_at) <= new Date(dateTo + 'T23:59:59'))
    return result
  }, [requests, statusFilter, dateFrom, dateTo])

  const columns: Column<Request>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'user_name', label: 'مقدم الطلب' },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'group_name', label: 'نوع المشكلة' },
    {
      key: 'priority', label: 'الأولوية', sortable: true,
      render: (r) => (
        <Badge variant={getPriorityColor(r.priority) as 'danger' | 'warning' | 'success'}>
          {r.priority === 'High' ? 'عالية' : r.priority === 'Medium' ? 'متوسطة' : 'عادية'}
        </Badge>
      ),
    },
    {
      key: 'status', label: 'الحالة', sortable: true,
      render: (r) => (
        <Badge variant={getStatusColor(r.status) as 'danger' | 'warning' | 'success' | 'info'}>
          {getStatusText(r.status)}
        </Badge>
      ),
    },
    { key: 'created_at', label: 'تاريخ التقديم', sortable: true, render: (r) => formatDateTime(r.created_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقارير البلاغات"
        description="عرض إحصائيات وتقارير البلاغات"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-muted-foreground', icon: BarChart3 },
          { label: 'معلق', value: stats.pending, color: 'text-yellow-600', icon: Clock },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-blue-600', icon: AlertTriangle },
          { label: 'تم الحل', value: stats.resolved, color: 'text-green-600', icon: CheckCircle },
          { label: 'ملغي', value: stats.cancelled, color: 'text-red-600', icon: XCircle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center py-4">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === tab.key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mr-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
                title="من تاريخ"
              />
              <span className="text-muted-foreground">إلى</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
                title="إلى تاريخ"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            searchable
            searchPlaceholder="بحث في التقرير..."
            id="reports-table"
            onExportExcel={() => exportToExcel(filtered, columns, 'تقرير_البلاغات')}
            onExportPDF={() => exportToPDF('reports-table', 'تقارير البلاغات')}
            emptyMessage="لا توجد بلاغات تطابق المعايير المحددة"
          />
        </CardBody>
      </Card>
    </div>
  )
}
