import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: string = 'ar'): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date, locale: string = 'ar'): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Pending: 'warning',
    'In Progress': 'info',
    Completed: 'success',
    Resolved: 'success',
    Cancelled: 'danger',
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
    Normal: 'primary',
  }
  return map[status] || 'secondary'
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    Pending: 'قيد الانتظار',
    'In Progress': 'قيد التنفيذ',
    Completed: 'تم الإنجاز',
    Resolved: 'تم الحل',
    Cancelled: 'ملغي',
    High: 'عالية',
    Medium: 'متوسطة',
    Low: 'منخفضة',
    Normal: 'عادية',
  }
  return map[status] || status
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
    Normal: 'primary',
  }
  return map[priority] || 'secondary'
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg'
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  return `/uploads/${path}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToExcel(data: any[], columns: { key: string; label: string }[], filename: string) {
  const visibleCols = columns.filter((c) => c.key !== 'actions')
  const headers = visibleCols.map((c) => c.label).join('\t')
  const rows = data.map((row) =>
    visibleCols
      .map((c) => {
        const val = row[c.key]
        return val != null ? String(val).replace(/\t/g, ' ') : ''
      })
      .join('\t')
  )
  const csv = '\uFEFF' + [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToPDF(
  tableId: string,
  title: string
) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  const table = document.getElementById(tableId)
  if (!table) return

  printWindow.document.write(`
    <html dir="rtl">
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 10px; text-align: center; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: right; }
        th { background: #f5f5f5; font-weight: bold; }
        .print-date { text-align: left; font-size: 11px; color: #666; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="print-date">تاريخ الطباعة: ${formatDateTime(new Date())}</div>
      ${table.outerHTML}
      <script>window.print();window.close();<\/script>
    </body>
    </html>
  `)
  printWindow.document.close()
}
