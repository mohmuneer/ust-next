'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksService } from '@/services/tasks.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, Clock, AlertTriangle, CheckCircle, XCircle, Star, Calendar,
} from 'lucide-react'
import type { Task } from '@/types'
import { getStatusColor, getStatusText, getPriorityColor, formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'

const statusTabs = [
  { key: 'all', label: 'الكل', icon: Clock },
  { key: 'Pending', label: 'قيد الانتظار', icon: Clock },
  { key: 'In Progress', label: 'قيد التنفيذ', icon: AlertTriangle },
  { key: 'Completed', label: 'مكتمل', icon: CheckCircle },
  { key: 'Cancelled', label: 'ملغي', icon: XCircle },
]

export default function TaskReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getAll(),
  })

  const stats = useMemo(() => {
    if (!tasks) return { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 }
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      cancelled: tasks.filter(t => t.status === 'Cancelled').length,
    }
  }, [tasks])

  const filtered = useMemo(() => {
    if (!tasks) return []
    let result = [...tasks]
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (dateFrom) result = result.filter(t => new Date(t.created_at) >= new Date(dateFrom))
    if (dateTo) result = result.filter(t => new Date(t.created_at) <= new Date(dateTo + 'T23:59:59'))
    return result
  }, [tasks, statusFilter, dateFrom, dateTo])

  const columns: Column<Task>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'technician_name', label: 'الفني', sortable: true },
    { key: 'requester_name', label: 'مقدم الطلب' },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'college_name', label: 'الكلية' },
    { key: 'group_name', label: 'نوع المشكلة' },
    {
      key: 'priority', label: 'الأولوية', sortable: true,
      render: (t) => (
        <Badge variant={getPriorityColor(t.priority) as 'danger' | 'warning' | 'success'}>
          {t.priority === 'High' ? 'عالية' : t.priority === 'Medium' ? 'متوسطة' : 'عادية'}
        </Badge>
      ),
    },
    {
      key: 'status', label: 'الحالة', sortable: true,
      render: (t) => (
        <Badge variant={getStatusColor(t.status) as 'danger' | 'warning' | 'success' | 'info'}>
          {getStatusText(t.status)}
        </Badge>
      ),
    },
    {
      key: 'deadline', label: 'الموعد النهائي',
      render: (t) => t.deadline
        ? <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(t.deadline)}</span>
        : '---',
    },
    {
      key: 'rating', label: 'التقييم',
      render: (t) => (
        t.rating
          ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{t.rating}/5</span>
          : '---'
      ),
    },
    { key: 'created_at', label: 'تاريخ الإنشاء', sortable: true, render: (t) => formatDateTime(t.created_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقارير المهام"
        description="عرض إحصائيات وتقارير المهام الفنية"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'الإجمالي', value: stats.total, color: 'text-muted-foreground', icon: BarChart3 },
          { label: 'قيد الانتظار', value: stats.pending, color: 'text-yellow-600', icon: Clock },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-blue-600', icon: AlertTriangle },
          { label: 'مكتمل', value: stats.completed, color: 'text-green-600', icon: CheckCircle },
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
            id="tasks-reports-table"
            onExportExcel={() => exportToExcel(filtered, columns, 'تقرير_المهام')}
            onExportPDF={() => exportToPDF('tasks-reports-table', 'تقارير المهام')}
            emptyMessage="لا توجد مهام تطابق المعايير المحددة"
          />
        </CardBody>
      </Card>
    </div>
  )
}
