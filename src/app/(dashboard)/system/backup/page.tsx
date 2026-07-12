'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardBody } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Database, Download, RotateCcw, HardDrive, Table2, Upload, AlertTriangle, Loader2 } from 'lucide-react'

export default function SystemBackupPage() {
  const [backupData, setBackupData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreMsg, setRestoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmRestore, setConfirmRestore] = useState(false)

  const generateBackup = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/db-backup')
      const data = await res.json()
      setBackupData(data)
    } catch {}
    setLoading(false)
  }

  const downloadBackup = () => {
    if (!backupData) return
    const json = JSON.stringify(backupData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setRestoreMsg({ type: 'error', text: 'يرجى اختيار ملف JSON صالح' })
      return
    }

    setRestoring(true)
    setRestoreMsg(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.data || !Array.isArray(data.data)) {
        setRestoreMsg({ type: 'error', text: 'تنسيق الملف غير صالح' })
        return
      }

      const res = await fetch('/api/db-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        setRestoreMsg({ type: 'success', text: result.message || 'تم استيراد البيانات بنجاح ✓' })
        setBackupData(data)
      } else {
        setRestoreMsg({ type: 'error', text: result.error || 'فشل استيراد البيانات' })
      }
    } catch {
      setRestoreMsg({ type: 'error', text: 'فشل قراءة الملف - يرجى التأكد من صحة التنسيق' })
    }
    setRestoring(false)
    setConfirmRestore(false)
    e.target.value = ''
  }

  const totalRows = backupData?.data?.reduce((sum: number, t: any) => sum + (t.count || 0), 0) || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="النسخ الاحتياطي"
        description="إنشاء وتحميل واستيراد النسخ الاحتياطية لقاعدة البيانات"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الجداول</p>
                <p className="text-2xl font-bold">{backupData?.data?.length || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Table2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                <p className="text-2xl font-bold">{totalRows}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <HardDrive className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر نسخة</p>
                <p className="text-sm font-semibold">{backupData?.generated_at || '---'}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">إنشاء نسخة احتياطية</h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button onClick={generateBackup} isLoading={loading}>
              <RotateCcw className="h-4 w-4 ml-1" /> إنشاء نسخة احتياطية
            </Button>
            <Button variant="outline" onClick={downloadBackup} disabled={!backupData}>
              <Download className="h-4 w-4 ml-1" /> تحميل JSON
            </Button>
          </div>

          {backupData?.data?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">محتويات النسخة:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {backupData.data.map((t: any) => (
                  <div key={t.table} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                    <span className="font-mono text-xs truncate ml-2">{t.table}</span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Import Section */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> استيراد نسخة احتياطية
          </h3>

          {restoreMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm mb-4 ${
              restoreMsg.type === 'success'
                ? 'bg-success/10 border border-success/30 text-success'
                : 'bg-danger/10 border border-danger/30 text-danger'
            }`}>
              {restoreMsg.text}
            </div>
          )}

          {!confirmRestore ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                قم باختيار ملف JSON تم تصديره سابقاً لاستعادة البيانات. سيتم استبدال جميع البيانات الحالية.
              </p>
              <Button variant="warning" onClick={() => setConfirmRestore(true)}>
                <Upload className="h-4 w-4 ml-1" /> استيراد نسخة احتياطية
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger">تحذير: استبدال كامل للبيانات</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    سيتم حذف جميع البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية.
                    لا يمكن التراجع عن هذه العملية.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <label className="cursor-pointer inline-flex">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                    disabled={restoring}
                  />
                  <span className="inline-flex items-center justify-center font-medium transition-all duration-200 h-12 px-6 text-base rounded-xl bg-danger text-white hover:bg-danger/90 shadow-sm disabled:opacity-50 disabled:pointer-events-none">
                    {restoring ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 ml-2" />
                    )}
                    اختيار ملف واستيراد
                  </span>
                </label>
                <Button variant="outline" onClick={() => setConfirmRestore(false)} disabled={restoring}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
