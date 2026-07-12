'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, FileArchive, File, Search, Filter } from 'lucide-react'
import { studentApi } from '@/services/student-api'

const DOC_TYPES = [
  { id: 'id', name: 'تعريف جامعي', icon: FileText, color: 'from-blue-500 to-cyan-600' },
  { id: 'transcript', name: 'كشف درجات', icon: FileArchive, color: 'from-emerald-500 to-teal-600' },
  { id: 'enrollment', name: 'إثبات قيد', icon: File, color: 'from-violet-500 to-purple-600' },
  { id: 'record', name: 'السجل الأكاديمي', icon: FileText, color: 'from-amber-500 to-orange-600' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    studentApi.get<any[]>('/documents').then((d) => {
      setDocuments(d || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = DOC_TYPES.filter((d) => d.name.includes(search) || search === '')

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المستندات</h1>
        <p className="text-gray-500 text-sm">تحميل المستندات الجامعية بصيغة PDF</p>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن مستند..."
          className="w-full h-11 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <button key={doc.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-right hover:shadow-md hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center shrink-0 shadow-sm`}>
                <doc.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{doc.name}</h3>
                <p className="text-xs text-gray-400 mt-1">PDF</p>
                <div className="flex items-center gap-2 mt-2">
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">تحميل</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {documents.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3 text-gray-500">المستندات السابقة</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title || doc.file_name || `مستند ${doc.id}`}</p>
                  <p className="text-xs text-gray-400">{doc.created_at ? new Date(doc.created_at).toLocaleDateString('ar-EG') : ''}</p>
                </div>
                <button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
