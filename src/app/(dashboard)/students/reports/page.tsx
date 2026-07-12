'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentsService } from '@/services/students.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { formatDateTime, exportToExcel, exportToPDF } from '@/lib/utils'
import { GraduationCap, Users, BookOpen, Activity } from 'lucide-react'
import type { Student } from '@/types'

export default function StudentReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getAll(),
  })

  const filtered = (data || []).filter((s) => {
    if (dateFrom && s.created_at && new Date(s.created_at) < new Date(dateFrom)) return false
    if (dateTo && s.created_at && new Date(s.created_at) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const activeCount = filtered.filter((s) => s.status === 'active').length
  const graduatedCount = filtered.filter((s) => s.status === 'graduated').length
  const suspendedCount = filtered.filter((s) => s.status === 'suspended').length

  const columns: Column<Student>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'student_number', label: 'رقم القيد', sortable: true },
    { key: 'full_name', label: 'الاسم', sortable: true },
    { key: 'college_name', label: 'الكلية' },
    { key: 'department_name', label: 'القسم' },
    { key: 'level_name', label: 'المستوى' },
    { key: 'group_name', label: 'المجموعة' },
    { key: 'semester_name', label: 'الترم' },
    {
      key: 'status', label: 'الحالة',
      render: (s) => {
        const map: Record<string, string> = {
          active: 'نشط', graduated: 'متخرج', suspended: 'موقوف', withdrawn: 'منسحب',
        }
        return map[s.status] || s.status
      },
    },
    {
      key: 'created_at',
      label: 'تاريخ التسجيل',
      sortable: true,
      render: (s) => formatDateTime(s.created_at!),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقارير الطلاب"
        description="إحصائيات وتقارير الطلاب المسجلين"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold">{filtered.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600" />
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
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متخرج</p>
                <p className="text-2xl font-bold text-yellow-600">{graduatedCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موقوف / منسحب</p>
                <p className="text-2xl font-bold text-red-600">{suspendedCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">من تاريخ:</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">إلى تاريخ:</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            searchable
            searchPlaceholder="بحث عن طالب..."
            id="students-report-table"
            onExportExcel={() => exportToExcel(filtered, columns, 'تقارير_الطلاب')}
            onExportPDF={() => exportToPDF('students-report-table', 'تقارير الطلاب')}
            emptyMessage="لا توجد بيانات طلاب مطابقة"
          />
        </CardBody>
      </Card>
    </div>
  )
}
