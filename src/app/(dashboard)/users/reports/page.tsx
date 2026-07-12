'use client'

import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserX, Shield } from 'lucide-react'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import type { User } from '@/types'

export default function UserReportsPage() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  })

  const users = data || []
  const activeCount = users.filter((u) => u.status === 1).length
  const inactiveCount = users.filter((u) => u.status !== 1).length

  const columns: Column<User>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد' },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'role_name', label: 'الدور' },
    {
      key: 'status',
      label: 'الحالة',
      render: (u) => (
        <Badge variant={u.status === 1 ? 'success' : 'danger'}>
          {u.status === 1 ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ التسجيل',
      sortable: true,
      render: (u) => formatDateTime(u.created_at!),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقارير المستخدمين"
        description="إحصائيات وتقارير مستخدمي النظام"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نشط</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">غير نشط</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={users}
            searchable
            searchPlaceholder="بحث عن مستخدم..."
            id="users-report-table"
            onExportExcel={() => exportToExcel(users, columns, 'تقارير_المستخدمين')}
            onExportPDF={() => exportToPDF('users-report-table', 'تقارير المستخدمين')}
            emptyMessage="لا يوجد مستخدمين"
          />
        </CardBody>
      </Card>
    </div>
  )
}
