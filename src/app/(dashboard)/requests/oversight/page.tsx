'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestsService } from '@/services/requests.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import {
  Shield, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Star, Calendar, Image as ImageIcon,
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

export default function RequestsOversightPage() {
  const [statusFilter, setStatusFilter] = useState('all')

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
    if (statusFilter === 'all') return requests
    return requests.filter((r) => r.status === statusFilter)
  }, [requests, statusFilter])

  const columns: Column<Request>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'problem_image', label: 'صورة',
      render: (r) => (
        r.problem_image
          ? <img src={`/uploads/${r.problem_image}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
          : <ImageIcon className="w-5 h-5 text-muted-foreground" />
      ),
    },
    { key: 'user_name', label: 'مقدم الطلب', sortable: true },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'group_name', label: 'نوع المشكلة' },
    { key: 'location_name', label: 'الموقع' },
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
    {
      key: 'technician_name', label: 'المهندس',
      render: (r) => r.technician_name || '---',
    },
    {
      key: 'task_id', label: 'مهمة',
      render: (r) => r.task_id
        ? <Badge variant={r.task_status === 'Completed' ? 'success' : r.task_status === 'In Progress' ? 'info' : r.task_status === 'Cancelled' ? 'danger' : 'warning'}>{getStatusText(r.task_status || '')}</Badge>
        : <span className="text-xs text-muted-foreground">بدون</span>,
    },
    {
      key: 'deadline', label: 'الموعد النهائي',
      render: (r) => r.deadline
        ? <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(r.deadline)}</span>
        : '---',
    },
    {
      key: 'rating', label: 'التقييم',
      render: (r) => (
        r.rating
          ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{r.rating}/5</span>
          : '---'
      ),
    },
    {
      key: 'created_at', label: 'التاريخ', sortable: true,
      render: (r) => formatDateTime(r.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="متابعة ورقابة البلاغات"
        description="مراقبة جميع البلاغات وحالاتها والمهام المسندة لها"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-muted-foreground' },
          { label: 'معلق', value: stats.pending, color: 'text-yellow-600' },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'تم الحل', value: stats.resolved, color: 'text-green-600' },
          { label: 'ملغي', value: stats.cancelled, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center py-4">
              <Shield className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

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

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={filtered}
            searchable
            searchPlaceholder="بحث..."
            id="oversight-table"
            onExportExcel={() => exportToExcel(filtered, columns, 'متابعة_البلاغات')}
            onExportPDF={() => exportToPDF('oversight-table', 'متابعة ورقابة البلاغات')}
            emptyMessage="لا توجد بلاغات"
          />
        </CardBody>
      </Card>
    </div>
  )
}
