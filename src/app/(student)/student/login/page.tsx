'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudentAuthStore } from '@/store/useStudentAuthStore'
import { setAuthCookie } from '@/lib/auth-cookies'

const loginSchema = z.object({
  student_number: z.string().min(1, 'الرجاء إدخال الرقم الجامعي'),
  password: z.string().min(1, 'الرجاء إدخال كلمة المرور'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function StudentLoginPage() {
  const router = useRouter()
  const { setAuth } = useStudentAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.message || 'بيانات الدخول غير صحيحة')
        return
      }

      setAuth(result.student, result.token)
      setAuthCookie('student_token', result.token)
      router.push('/student/dashboard')
    } catch {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(to bottom right, var(--color-primary-dark, #025a87), var(--color-primary, #038ed3))',
      }}
    >
      <div className="w-full max-w-[900px] flex bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden animate-in">
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 bg-gradient-to-b from-gray-50 to-white border-l border-gray-100">
        <div className="relative w-36 h-36 mb-6">
          <div className="w-full h-full rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center p-3">
            <img src="/ust-logo.png" alt="UST" className="w-full h-full object-contain" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary opacity-30 animate-spin" style={{ animationDuration: '12s' }} />
        </div>
        <h2 className="text-primary-dark text-lg font-bold">جامعة العلوم والتكنولوجيا</h2>
        <p className="text-gray-400 text-xs mt-2">البوابة الإلكترونية للطالب</p>
      </div>

      <div className="flex-[1.2] p-10 flex flex-col justify-center">
        <div className="md:hidden flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center p-2">
            <img src="/ust-logo.png" alt="UST" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-primary-dark text-center mb-1">تسجيل دخول الطالب</h1>
        <p className="text-sm text-gray-500 text-center mb-8">أدخل رقمك الجامعي وكلمة المرور</p>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input
              {...register('student_number')}
              type="text"
              autoComplete="username"
              placeholder="الرقم الجامعي"
              className="w-full h-12 pr-12 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {errors.student_number && <p className="text-xs text-danger mt-1">{errors.student_number.message}</p>}
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="كلمة المرور"
              className="w-full h-12 pr-12 pl-12 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full h-12 text-base">
            دخول
          </Button>
        </form>

        <p className="text-center text-[10px] text-gray-300 mt-8">
          جميع الحقوق محفوظة &copy; بوابة الطالب الإلكترونية 2026
        </p>
      </div>
    </div>
  </div>
  )
}
