'use client'

import { useState, useEffect } from 'react'
import { Library, BookOpen, Search, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { studentApi } from '@/services/student-api'
import { getImageUrl } from '@/lib/utils'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'

type Tab = 'books' | 'borrowings'

const BORROW_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'مستعار', color: 'bg-blue-100 text-blue-700', icon: Clock },
  returned: { label: 'تم الإرجاع', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  overdue: { label: 'متأخر', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export default function LibraryPage() {
  const { student } = useStudentAuthStore()
  const [tab, setTab] = useState<Tab>('books')
  const [books, setBooks] = useState<any[]>([])
  const [borrowings, setBorrowings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated || !student) return
    Promise.all([
      studentApi.get<any[]>('/student-library-books'),
      studentApi.get<any[]>(`/student-library-borrowings?student_id=${student.id}`),
    ]).then(([b, br]) => {
      setBooks(b || [])
      setBorrowings(br || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [hydrated, student])

  const filteredBooks = books.filter((b) => !search || b.title?.includes(search) || b.author?.includes(search))

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المكتبة</h1>
        <p className="text-gray-500 text-sm">الكتب والاستعارات المكتبة</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('books')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'books' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
          }`}>
          <BookOpen className="h-4 w-4" /> الكتب
        </button>
        <button onClick={() => setTab('borrowings')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'borrowings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
          }`}>
          <Library className="h-4 w-4" /> الاستعارات
        </button>
      </div>

      {tab === 'books' && (
        <>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن كتاب..."
              className="w-full h-11 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">لا توجد كتب متاحة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBooks.map((book) => (
                <div key={book.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  {book.cover_image ? (
                    <img src={getImageUrl(book.cover_image)} alt={book.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-blue-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1">{book.title}</h3>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    {book.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                        {book.category}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">النسخ المتاحة: {book.available_copies ?? 0}</span>
                      <span className={`text-xs font-medium ${(book.available_copies ?? 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {(book.available_copies ?? 0) > 0 ? 'متاح' : 'غير متاح'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'borrowings' && (
        <>
          {borrowings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <Library className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">لا توجد استعارات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowings.map((b) => {
                const status = BORROW_STATUS[b.status] || BORROW_STATUS.active
                return (
                  <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-sm">{b.book_title || b.title}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                            <status.icon className="h-3 w-3" /> {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />تاريخ الاستعارة: {b.borrow_date || '---'}</span>
                          <span>الإعادة المتوقعة: {b.due_date || '---'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
