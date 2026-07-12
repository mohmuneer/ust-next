'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import {
  Ticket, Users, Building2, PieChart, GraduationCap, BookOpen,
  FileQuestion, Layers, Tags, ClipboardList, FlaskConical,
  BookCopy, CalendarDays, UsersRound,
  ArrowLeft, TrendingUp, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { Request } from '@/types'
import { getStatusColor, getStatusText, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const statCards = [
  { label: 'البلاغات', key: 'total_requests', icon: Ticket, variant: 'primary' as const, href: '/requests' },
  { label: 'الطلاب', key: 'total_students', icon: GraduationCap, variant: 'success' as const, href: '/students' },
  { label: 'المستخدمون', key: 'total_users', icon: Users, variant: 'danger' as const, href: '/users' },
  { label: 'الامتحانات', key: 'total_exams', icon: FileQuestion, variant: 'info' as const, href: '/exams' },
]

const schoolCards = [
  { label: 'الكليات', key: 'total_colleges', icon: Building2, href: '/colleges' },
  { label: 'الأقسام', key: 'total_departments', icon: Layers, href: '/departments' },
  { label: 'المعامل', key: 'total_labs', icon: FlaskConical, href: '/labs' },
  { label: 'المستويات', key: 'total_levels', icon: TrendingUp, href: '/study-levels' },
  { label: 'المجموعات', key: 'total_groups', icon: Tags, href: '/study-groups' },
  { label: 'المواد', key: 'total_subjects', icon: BookOpen, href: '/study-subjects' },
  { label: 'الفصول', key: 'total_semesters', icon: CalendarDays, href: '/academic-semesters' },
  { label: 'أولياء أمور', key: 'total_guardians', icon: UsersRound, href: '/guardians' },
]

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  })

  const requestColumns: Column<Request>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'user_name', label: 'مقدم الطلب' },
    { key: 'branch_name', label: 'الفرع' },
    {
      key: 'priority', label: 'الأولوية', sortable: true,
      render: (r) => <Badge variant={getStatusColor(r.priority) as 'danger' | 'warning' | 'success'}>{r.priority}</Badge>,
    },
    {
      key: 'status', label: 'الحالة', sortable: true,
      render: (r) => <Badge variant={getStatusColor(r.status) as 'danger' | 'warning' | 'success'}>{getStatusText(r.status)}</Badge>,
    },
    { key: 'created_at', label: 'التاريخ', sortable: true, render: (r) => formatDateTime(r.created_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" description="نظرة عامة على النظام" />

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats ? String((stats as any)[card.key] ?? 0) : '0'}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `var(--color-${card.variant}, var(--color-primary))` }}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Request stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> تحليل البلاغات
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'معلق', value: stats?.pending_requests, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
              { label: 'قيد التنفيذ', value: stats?.in_progress_requests, icon: TrendingUp, color: 'text-info', bg: 'bg-info/10' },
              { label: 'تم الحل', value: stats?.resolved_requests, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
              { label: 'ملغي', value: stats?.cancelled_requests, icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <s.icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* School stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookCopy className="h-5 w-5 text-primary" /> إحصائيات أكاديمية
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {schoolCards.map((card) => (
              <Link key={card.key} href={card.href}>
                <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <card.icon className="h-5 w-5 text-primary mb-1" />
                  <p className="text-lg font-bold">{stats ? String((stats as any)[card.key] ?? 0) : '0'}</p>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight">{card.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {stats?.status_distribution?.length ? (
                stats.status_distribution.map((s) => {
                  const maxVal = Math.max(...stats.status_distribution.map((x) => x.count), 1)
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm">{s.label}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(3, (s.count / maxVal) * 100)}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-left">{s.count}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد بلاغات بعد</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأولويات</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {stats?.priority_distribution?.length ? (
                stats.priority_distribution.map((p) => {
                  const maxVal = Math.max(...stats.priority_distribution.map((x) => x.count), 1)
                  return (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm">{p.label}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(3, (p.count / maxVal) * 100)}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-left">{p.count}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Monthly trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> الاتجاه الشهري للبلاغات
          </CardTitle>
        </CardHeader>
        <CardBody>
          {stats?.monthly_trends?.length ? (
            <div className="flex items-end gap-2 h-40">
              {stats.monthly_trends.map((m) => {
                const maxCount = Math.max(...stats.monthly_trends.map((x) => x.count), 1)
                const height = Math.max(8, (m.count / maxCount) * 100)
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold">{m.count}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${height}%`, backgroundColor: '#3b82f6', minHeight: 4 }} />
                    <span className="text-[10px] text-muted-foreground">{m.month.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد بيانات شهرية</p>
          )}
        </CardBody>
      </Card>

      {/* Branch distribution & recent requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع البلاغات حسب الفرع</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {stats?.branch_user_distribution?.length ? (
                stats.branch_user_distribution.map((b) => {
                  const maxCount = Math.max(...stats.branch_user_distribution.map((x) => x.count), 1)
                  return (
                    <div key={b.label} className="flex items-center gap-3">
                      <span className="text-sm w-28 truncate">{b.label}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(b.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-left">{b.count}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مهام اليوم</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'معلق', value: stats?.pending_tasks, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'قيد التنفيذ', value: stats?.in_progress_tasks, color: 'text-info', bg: 'bg-info/10' },
                { label: 'مكتمل', value: stats?.completed_tasks, color: 'text-success', bg: 'bg-success/10' },
              ].map((t) => (
                <div key={t.label} className={`${t.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${t.color}`}>{t.value ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">نسبة الإنجاز</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-success transition-all" style={{ width: `${stats?.completion_rate || 0}%` }} />
                </div>
                <span className="text-sm font-bold text-success">{stats?.completion_rate || 0}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle>آخر الطلبات</CardTitle>
          <Link href="/requests"><Button variant="outline" size="sm">عرض الكل <ArrowLeft className="h-4 w-4 mr-1" /></Button></Link>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={requestColumns}
            data={(stats?.recent_requests || []) as unknown as Request[]}
            searchable={false}
            pageSize={5}
            emptyMessage="لا توجد طلبات بعد"
          />
        </CardBody>
      </Card>
    </div>
  )
}
