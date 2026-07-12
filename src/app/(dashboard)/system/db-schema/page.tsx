'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { systemService } from '@/services/system.service'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Database, Table2, Columns3, Search, RotateCcw } from 'lucide-react'

const typeLabels: Record<string, string> = {
  'integer': 'عدد صحيح',
  'character varying': 'نص',
  'text': 'نص طويل',
  'boolean': 'منطقي',
  'timestamp without time zone': 'تاريخ ووقت',
  'date': 'تاريخ',
  'time without time zone': 'وقت',
  'double precision': 'رقم عشري',
  'numeric': 'رقم',
  'jsonb': 'JSON',
  'bigint': 'عدد كبير',
  'smallint': 'عدد صغير',
}

export default function DbSchemaPage() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])

  const { data } = useQuery({
    queryKey: ['db-schema'],
    queryFn: () => systemService.getDbSchema(),
  })

  const tables = (data || []).filter((t: any) =>
    !search || t.table_name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleTable = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const handleExpandAll = () => {
    if (expanded.length === tables.length) setExpanded([])
    else setExpanded(tables.map((t: any) => t.table_name))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="هيكل قاعدة البيانات"
        description="عرض هيكل وجداول قاعدة البيانات"
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن جدول..."
            className="pr-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleExpandAll}>
          <RotateCcw className="h-4 w-4 ml-1" /> {expanded.length === tables.length ? 'طي الكل' : 'توسيع الكل'}
        </Button>
      </div>

      <div className="space-y-3">
        {tables.map((t: any) => (
          <Card key={t.table_name}>
            <CardBody className="p-0">
              <button
                onClick={() => toggleTable(t.table_name)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <Table2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-right flex-1">{t.table_name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {t.columns?.length || 0} أعمدة
                </span>
              </button>

              {expanded.includes(t.table_name) && (
                <div className="border-t border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-right px-4 py-2 font-medium">العمود</th>
                        <th className="text-right px-4 py-2 font-medium">النوع</th>
                        <th className="text-right px-4 py-2 font-medium">إفتراضي</th>
                        <th className="text-center px-4 py-2 font-medium">غير قابل للفراغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(t.columns || []).map((col: any, ci: number) => (
                        <tr key={col.column_name} className={ci % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="px-4 py-2 font-mono text-xs">{col.column_name}</td>
                          <td className="px-4 py-2 text-xs">
                            {typeLabels[col.data_type] || col.data_type}
                            {col.character_maximum_length ? ` (${col.character_maximum_length})` : ''}
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{col.column_default || '---'}</td>
                          <td className="px-4 py-2 text-center text-xs">
                            {col.is_nullable === 'YES' ? (
                              <span className="text-green-600">لا</span>
                            ) : (
                              <span className="text-red-600">نعم</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
