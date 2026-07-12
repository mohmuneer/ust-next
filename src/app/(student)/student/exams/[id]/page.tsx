'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FileQuestion, Clock, CheckCircle2, AlertTriangle, Shield, Monitor, Smartphone, Laptop, Play } from 'lucide-react'
import { studentApi } from '@/services/student-api'

export default function ExamDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    studentApi.get<any>(`/exams/${params.id}`).then((d) => {
      setExam(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">جاري التحميل...</div>
  if (!exam) return <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">الاختبار غير موجود</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <p className="text-gray-500 text-sm">{exam.subject_name}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <FileQuestion className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xs text-gray-500">الدرجة النهائية</p>
            <p className="font-bold">{exam.total_marks || '---'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-gray-500">الزمن</p>
            <p className="font-bold">{exam.duration_minutes || '---'} دقيقة</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-500">المحاولات</p>
            <p className="font-bold">{exam.max_attempts || 1}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-gray-500">مخالفات مسموح</p>
            <p className="font-bold">{exam.max_focus_lost || 5}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-sm flex items-center gap-2 text-amber-800 mb-2">
            <Shield className="h-4 w-4" /> تعليمات الأمان
          </h3>
          <ul className="text-sm text-amber-700 space-y-1.5 pr-5 list-disc">
            <li>الاختبار يعمل في وضع ملء الشاشة (Fullscreen).</li>
            <li>لا يمكن مغادرة صفحة الاختبار أو فتح نافذة أخرى.</li>
            <li>يتم تسجيل كل مخالفة (فقدان التركيز، محاولة مغادرة الصفحة).</li>
            <li>بعد {exam.max_focus_lost || 5} مخالفات يتم إنهاء الاختبار تلقائياً.</li>
            <li>يتم حفظ الإجابات تلقائياً كل 10 ثوانٍ.</li>
            <li>عند انتهاء الوقت يتم تسليم الاختبار تلقائياً.</li>
            <li>لا يمكن فتح الاختبار من أكثر من جهاز في نفس الوقت.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2">طريقة التنقل بين الأسئلة</h3>
          <p className="text-sm text-gray-600">يمكنك التنقل بين الأسئلة بحرية باستخدام الأزرار. يمكنك تغيير إجابتك في أي وقت قبل الضغط على "تسليم". سؤال غير مجاب عليه سيتم اعتباره خطأ.</p>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2">الأجهزة المسموح بها</h3>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs"><Monitor className="h-3.5 w-3.5" /> كمبيوتر</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs"><Laptop className="h-3.5 w-3.5" /> لابتوب</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs"><Smartphone className="h-3.5 w-3.5" /> جوال (غير موصى به)</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
          <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <label htmlFor="agree" className="text-sm text-gray-600">
            أقر بأنني اطلعت على تعليمات الاختبار وسياسة الأمان، وأتعهد بالالتزام بها. كما أقر بأن أي محاولة للغش أو مخالفة التعليمات قد تؤدي إلى إلغاء الاختبار.
          </label>
        </div>

        <button onClick={() => router.push(`/student/exams/take/${exam.id}`)} disabled={!agreed}
          className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25">
          <Play className="h-5 w-5 inline ml-2" /> ابدأ الاختبار
        </button>
      </div>
    </div>
  )
}
