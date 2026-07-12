'use client'

import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, CheckCircle2, AlertTriangle, Clock, Download, FileText } from 'lucide-react'
import { studentApi } from '@/services/student-api'

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentApi.get<any[]>('/student-fees').then((d) => {
      setFees(d || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalDue = fees.filter((f) => f.status !== 'paid' && f.status !== 'cancelled').reduce((s, f) => s + parseFloat(f.amount || f.remaining_amount || 0), 0)
  const totalPaid = fees.filter((f) => f.status === 'paid').reduce((s, f) => s + parseFloat(f.paid_amount || f.amount || 0), 0)
  const overdue = fees.filter((f) => f.due_date && new Date(f.due_date) < new Date() && f.status !== 'paid' && f.status !== 'cancelled')

  if (loading) return <div className="max-w-4xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الرسوم المالية</h1>
        <p className="text-gray-500 text-sm">الرسوم الدراسية والمدفوعات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">المتبقي</span>
          </div>
          <p className="text-xl font-bold text-red-600">{totalDue.toLocaleString('ar-EG')} ر.ي</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">المدفوع</span>
          </div>
          <p className="text-xl font-bold text-green-600">{totalPaid.toLocaleString('ar-EG')} ر.ي</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">المتأخر</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{overdue.length} رسوم</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">لديك {overdue.length} رسوم متأخرة. يرجى تسديدها في أقرب وقت.</p>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">لا توجد رسوم مالية</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-right p-3 font-medium text-gray-500">البيان</th>
                  <th className="text-right p-3 font-medium text-gray-500">المبلغ</th>
                  <th className="text-right p-3 font-medium text-gray-500">المدفوع</th>
                  <th className="text-right p-3 font-medium text-gray-500">المتبقي</th>
                  <th className="text-right p-3 font-medium text-gray-500">تاريخ الاستحقاق</th>
                  <th className="text-right p-3 font-medium text-gray-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => {
                  const amt = parseFloat(f.amount || 0)
                  const paid = parseFloat(f.paid_amount || 0)
                  const remaining = parseFloat(f.remaining_amount || (amt - paid))
                  return (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-3">
                        <p className="font-medium">{f.fee_name || `رسوم ${f.fee_type_id}`}</p>
                        {f.fee_code && <p className="text-[10px] text-gray-400">{f.fee_code}</p>}
                      </td>
                      <td className="p-3 font-medium">{amt.toLocaleString()}</td>
                      <td className="p-3 text-green-600">{paid.toLocaleString()}</td>
                      <td className="p-3 text-red-600">{remaining.toLocaleString()}</td>
                      <td className="p-3 text-gray-500">{f.due_date || '---'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          f.status === 'paid' ? 'bg-green-100 text-green-700' :
                          f.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                          f.status === 'waived' ? 'bg-blue-100 text-blue-700' :
                          f.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {f.status === 'paid' ? 'مدفوع' : f.status === 'partial' ? 'جزئي' : f.status === 'waived' ? 'معفي' : f.status === 'cancelled' ? 'ملغي' : 'غير مدفوع'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
