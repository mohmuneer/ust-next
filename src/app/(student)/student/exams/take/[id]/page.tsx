'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import {
  Clock, AlertTriangle, ChevronRight, ChevronLeft, Send, Shield,
  Monitor, Smartphone, CheckCircle2, XCircle, HelpCircle,
} from 'lucide-react'

type Question = {
  id: number
  question_text: string
  question_type: string
  options: string[]
  points: number
}

export default function ExamTakePage() {
  const router = useRouter()
  const params = useParams()
  const { student } = useStudentAuthStore()

  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [sessionId, setSessionId] = useState<number>(0)
  const [sessionToken, setSessionToken] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [violations, setViolations] = useState(0)
  const [inFullscreen, setInFullscreen] = useState(false)
  const [connectionOk, setConnectionOk] = useState(true)

  const startTimeRef = useRef(Date.now())
  const focusLostRef = useRef(0)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const violatedRef = useRef(false)

  // Get device info
  const getDeviceInfo = () => ({
    device_id: localStorage.getItem('exam_device_id') || (() => {
      const id = 'dev_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('exam_device_id', id)
      return id
    })(),
    fingerprint: navigator.userAgent + screen.width + screen.height + navigator.language,
    os_info: navigator.platform + ' ' + navigator.userAgent.substring(0, 100),
  })

  // Start exam session
  const startExam = useCallback(async () => {
    if (!student) return
    setError('')
    try {
      const device = getDeviceInfo()
      const res = await fetch('/api/exam-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: parseInt(params.id as string),
          student_id: student.id,
          ...device,
        }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }

      setExam(data.exam)
      setSessionId(data.session_id)
      setSessionToken(data.session_token)
      setTimeLeft((data.duration_minutes || 60) * 60)
      startTimeRef.current = Date.now()

      // Load questions
      const qRes = await fetch('/api/exam-questions-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: parseInt(params.id as string),
          session_id: data.session_id,
          token: data.session_token,
        }),
      })
      const qData = await qRes.json()
      if (qData.success) {
        setQuestions(qData.questions)
        // Load existing answers if resuming
        if (data.resumed) {
          try {
            const ansRes = await fetch(`/api/exam-answers?exam_session_id=${data.session_id}`)
            const ansData = await ansRes.json()
            if (Array.isArray(ansData)) {
              const restored: Record<number, string> = {}
              ansData.forEach((a: any) => { if (a.answer_text) restored[a.question_id] = a.answer_text })
              setAnswers(restored)
            }
          } catch {}
        }
      }
      setLoading(false)
    } catch { setError('فشل بدء الاختبار'); setLoading(false) }
  }, [student, params.id])

  useEffect(() => { startExam() }, [startExam])

  // Request fullscreen
  useEffect(() => {
    if (!loading && !submitted) {
      const el = document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen().then(() => setInFullscreen(true)).catch(() => {})
      }
    }
  }, [loading, submitted])

  // Fullscreen change monitoring
  useEffect(() => {
    const handler = () => {
      setInFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement && !submitted && sessionId) {
        logSecurityEvent('fullscreen_exit', {})
      }
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [submitted, sessionId])

  // Prevent navigation
  useEffect(() => {
    if (submitted) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    // Prevent back
    window.history.pushState(null, '', window.location.href)
    const popHandler = () => {
      window.history.pushState(null, '', window.location.href)
      logSecurityEvent('page_exit_attempt', {})
    }
    window.addEventListener('popstate', popHandler)
    // Prevent context menu
    const ctxHandler = (e: MouseEvent) => { e.preventDefault() }
    document.addEventListener('contextmenu', ctxHandler)

    return () => {
      window.removeEventListener('beforeunload', handler)
      window.removeEventListener('popstate', popHandler)
      document.removeEventListener('contextmenu', ctxHandler)
    }
  }, [submitted, sessionId])

  // Focus monitoring
  useEffect(() => {
    if (submitted || !sessionId) return
    const handleBlur = () => {
      if (violatedRef.current) return
      focusLostRef.current = Date.now()
      logSecurityEvent('focus_lost', {})
    }
    const handleFocus = () => {
      if (focusLostRef.current > 0 && !violatedRef.current) {
        const duration = Math.round((Date.now() - focusLostRef.current) / 1000)
        if (duration > 2) {
          setViolations((v) => {
            const newV = v + 1
            logSecurityEvent('focus_lost', { duration })
            if (newV >= (exam?.max_focus_lost || 5)) {
              violatedRef.current = true
              terminateExam('تجاوز عدد مخالفات فقدان التركيز المسموح به')
            }
            return newV
          })
        }
        focusLostRef.current = 0
      }
    }
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleBlur()
      else handleFocus()
    })
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [submitted, sessionId, exam])

  // Timer
  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { autoSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading, submitted, timeLeft])

  // Auto-save every 10 seconds
  useEffect(() => {
    if (submitted || !sessionId) return
    autoSaveRef.current = setInterval(() => {
      saveAllAnswers()
    }, 10000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [submitted, sessionId, answers])

  // Connection monitoring
  useEffect(() => {
    if (submitted || !sessionId) return
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setConnectionOk(false)
        logSecurityEvent('connection_drop', {})
      } else {
        setConnectionOk(true)
      }
    }, 5000)
    window.addEventListener('online', () => setConnectionOk(true))
    window.addEventListener('offline', () => { setConnectionOk(false); logSecurityEvent('connection_drop', {}) })
    return () => clearInterval(interval)
  }, [submitted, sessionId])

  // Keyboard shortcuts prevention
  useEffect(() => {
    if (submitted) return
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey && ['c','v','p','s','u','r','w','t','n'].includes(e.key.toLowerCase())) ||
          e.key === 'F12' || e.key === 'PrintScreen' ||
          (e.altKey && e.key === 'Tab') ||
          (e.altKey && e.key === 'F4')) {
        e.preventDefault()
        logSecurityEvent('keyboard_shortcut', { key: e.key })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [submitted, sessionId])

  const logSecurityEvent = async (eventType: string, eventData: any) => {
    try {
      await fetch('/api/exam-security-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, event_type: eventType, event_data: eventData, token: sessionToken }),
      })
    } catch {}
  }

  const saveAllAnswers = async () => {
    if (!sessionId || !sessionToken || Object.keys(answers).length === 0) return
    try {
      await fetch('/api/exam-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          token: sessionToken,
          answers: answers,
          auto_save: true,
        }),
      })
    } catch {}
  }

  const autoSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    try {
      await fetch('/api/exam-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, token: sessionToken, answers }),
      })
    } catch {}
    window.location.href = `/student/exams/${params.id}`
  }

  const terminateExam = async (reason: string) => {
    setSubmitted(true)
    try {
      await logSecurityEvent('exam_terminated', { reason })
      await fetch('/api/exam-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, token: sessionToken, answers }),
      })
    } catch {}
    alert(`تم إنهاء الاختبار: ${reason}`)
    window.location.href = `/student/exams`
  }

  const handleSubmit = async () => {
    if (submitting || submitted) return
    const confirmed = window.confirm('هل أنت متأكد من تسليم الاختبار؟ لا يمكن التراجع عن هذا الإجراء.')
    if (!confirmed) return
    setSubmitting(true)
    setSubmitted(true)
    try {
      const res = await fetch('/api/exam-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, token: sessionToken, answers }),
      })
      const data = await res.json()
      setResult(data)
      if (data.success) {
        if (document.fullscreenElement) document.exitFullscreen()
      }
    } catch {}
    setSubmitting(false)
  }

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => {
      if (value === '' || prev[questionId] === value) {
        const next = { ...prev }
        next[questionId] = value || ''
        return next
      }
      return { ...prev, [questionId]: value }
    })
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const timerPercent = exam ? (timeLeft / ((exam.duration_minutes || 60) * 60)) * 100 : 100

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><div className="text-center"><Clock className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" /><p>جاري تجهيز الاختبار...</p></div></div>
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="bg-red-900/50 text-red-200 p-6 rounded-2xl max-w-md text-center"><AlertTriangle className="h-12 w-12 mx-auto mb-4" /><p className="text-lg font-bold mb-2">خطأ</p><p>{error}</p><button onClick={startExam} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl">إعادة المحاولة</button></div></div>
  if (submitted && result) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/10">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.success ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
          {result.success ? <CheckCircle2 className="h-10 w-10 text-green-400" /> : <AlertTriangle className="h-10 w-10 text-amber-400" />}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">تم تسليم الاختبار</h2>
        <p className="text-gray-400 mb-4">{result.message}</p>
        <div className="flex justify-center gap-6">
          <div className="text-center"><p className="text-xs text-gray-500">الدرجة</p><p className="text-xl font-bold text-white">{result.score ?? '---'}</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">من</p><p className="text-xl font-bold text-white">{result.total ?? '---'}</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">النسبة</p><p className="text-xl font-bold text-green-400">{result.percentage ?? '---'}%</p></div>
        </div>
        <button onClick={() => router.push('/student/exams')} className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark w-full">العودة للاختبارات</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex flex-col" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-white font-bold text-sm hidden sm:block">{exam?.title || 'اختبار'}</span>
          </div>
          <div className="flex items-center gap-6">
            {!connectionOk && <span className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> انقطع الاتصال</span>}
            {violations > 0 && <span className="text-amber-400 text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> مخالفات: {violations}/{exam?.max_focus_lost || 5}</span>}
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-primary'}`} />
              <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        {/* Timer bar */}
        <div className="max-w-6xl mx-auto mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 300 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${timerPercent}%` }} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 flex gap-4 overflow-hidden">
        {/* Question Navigator */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
          <h3 className="text-white/60 text-xs font-bold mb-3">الأسئلة</h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined
              const isCurrent = i === currentIndex
              return (
                <button key={q.id} onClick={() => setCurrentIndex(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-primary bg-primary text-white' :
                    isAnswered ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}>
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div className="w-3 h-3 rounded bg-green-500/30" /><span>مجاب</span>
              <div className="w-3 h-3 rounded bg-white/10 mr-2" /><span>غير مجاب</span>
            </div>
            <p className="text-xs text-white/30">تمت الإجابة على {answeredCount} من {questions.length}</p>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentQ && (
            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40">سؤال {currentIndex + 1} من {questions.length}</span>
                <span className="text-xs text-primary">{currentQ.points || 1} درجة</span>
              </div>
              <h2 className="text-white text-lg font-bold mb-6 leading-relaxed">{currentQ.question_text}</h2>

              {currentQ.question_type === 'choice' || currentQ.question_type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {currentQ.options?.map((opt, oi) => (
                    <button key={oi} onClick={() => handleAnswer(currentQ.id, opt)}
                      className={`w-full p-4 rounded-xl border text-right transition-all text-sm ${
                        answers[currentQ.id] === opt
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5'
                      }`}>
                      <span className="ml-3 inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold border text-white/50 border-white/20">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : currentQ.question_type === 'true_false' ? (
                <div className="flex gap-4">
                  {['صح', 'خطأ'].map((opt) => (
                    <button key={opt} onClick={() => handleAnswer(currentQ.id, opt)}
                      className={`flex-1 p-6 rounded-xl border text-center transition-all ${
                        answers[currentQ.id] === opt
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-white/10 text-white/70 hover:border-white/30'
                      }`}>
                      <span className="text-lg font-bold">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea key={currentQ.id} value={answers[currentQ.id] ?? ''} onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  className="w-full h-40 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="اكتب إجابتك هنا..." />
              )}
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all">
                <ChevronRight className="h-4 w-4" /> السابق
              </button>
              <button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all">
                التالي <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleSubmit} disabled={submitting || submitted}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-bold disabled:opacity-50 shadow-lg shadow-green-600/25">
              <Send className="h-4 w-4" /> {submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
