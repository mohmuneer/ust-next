'use client'

import { useQuery } from '@tanstack/react-query'
import { systemService } from '@/services/system.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { exportToExcel, exportToPDF, formatDateTime } from '@/lib/utils'
import type { SystemLog } from '@/types'

const actionLabels: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  login: 'دخول',
  logout: 'خروج',
  export: 'تصدير',
  backup: 'نسخ احتياطي',
}

export default function SystemLogsPage() {
  const { data } = useQuery({
    queryKey: ['system-logs'],
    queryFn: () => systemService.getLogs(),
  })

  const columns: Column<SystemLog>[] = [
    { key: 'id', label: '#', sortable: true },
    {
      key: 'created_at',
      label: 'التاريخ',
      sortable: true,
      render: (l) => formatDateTime(l.created_at),
    },
    { key: 'user_name', label: 'المستخدم' },
    {
      key: 'action',
      label: 'الإجراء',
      render: (l) => {
        const colors: Record<string, string> = {
          create: 'text-green-600 bg-green-100 dark:bg-green-900/30',
          update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
          delete: 'text-red-600 bg-red-100 dark:bg-red-900/30',
          login: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
        }
        return (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[l.action] || 'bg-muted'}`}>
            {actionLabels[l.action] || l.action}
          </span>
        )
      },
    },
    { key: 'entity', label: 'الكيان' },
    { key: 'entity_id', label: 'رقم الكيان' },
    { key: 'details', label: 'التفاصيل' },
    { key: 'ip_address', label: 'IP' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل النشاطات"
        description="سجل جميع العمليات والإجراءات في النظام"
      />

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={data || []}
            searchable
            searchPlaceholder="بحث في السجل..."
            id="system-logs-table"
            onExportExcel={() => exportToExcel(data || [], columns, 'سجل_النشاطات')}
            onExportPDF={() => exportToPDF('system-logs-table', 'سجل النشاطات')}
            emptyMessage="لا توجد نشاطات مسجلة بعد"
          />
        </CardBody>
      </Card>
    </div>
  )
}
