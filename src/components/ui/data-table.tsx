'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, FileDown, FileText, Eye, EyeOff, Loader2, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  hidden?: boolean
  render?: (item: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  id?: string
  onExportExcel?: () => void
  onExportPDF?: () => void
  actions?: (item: T) => ReactNode
  emptyMessage?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  searchable = true,
  searchPlaceholder,
  pageSize = 25,
  id,
  onExportExcel,
  onExportPDF,
  actions,
  emptyMessage,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter((c) => !c.hidden).map((c) => c.key))
  )
  const [showColumnMenu, setShowColumnMenu] = useState(false)

  const visibleCols = columns.filter((c) => visibleColumns.has(c.key))

  const filteredData = useMemo(() => {
    let items = [...data]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((item) =>
        visibleCols.some((col) => {
          const val = item[col.key]
          return val != null && String(val).toLowerCase().includes(q)
        })
      )
    }
    if (sortKey) {
      items.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        const cmp = String(aVal).localeCompare(String(bVal), 'ar')
        return sortOrder === 'asc' ? cmp : -cmp
      })
    }
    return items
  }, [data, search, sortKey, sortOrder, visibleCols])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const toggleColumn = (key: string) => {
    const next = new Set(visibleColumns)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setVisibleColumns(next)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder={searchPlaceholder || 'بحث...'}
                className="pl-3 pr-9 w-56"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExportExcel && (
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <FileDown className="h-4 w-4 ml-1" /> Excel
            </Button>
          )}
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileText className="h-4 w-4 ml-1" /> PDF
            </Button>
          )}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowColumnMenu(!showColumnMenu)}>
              <Eye className="h-4 w-4 ml-1" /> أعمدة
            </Button>
            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-lg p-2 z-50">
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table id={id} className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
                      )
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + (actions ? 1 : 0)}>
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Inbox className="h-12 w-12 mb-3 opacity-50" />
                    <p>{emptyMessage || 'لا توجد بيانات'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  {visibleCols.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                      {col.render ? col.render(item) : String(item[col.key] ?? '---')}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            عرض {((page - 1) * pageSize) + 1} إلى {Math.min(page * pageSize, filteredData.length)} من {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="min-w-[2rem]"
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
