'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useEmployeeAuthStore } from '@/store/useEmployeeAuthStore'
import { setAuthCookie } from '@/lib/auth-cookies'
import { cn } from '@/lib/utils'

const userSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'الرجاء إدخال كلمة المرور'),
})

const employeeSchema = z.object({
  employee_code: z.string().min(1, 'الرجاء إدخال الكود الوظيفي'),
  password: z.string().min(1, 'الرجاء إدخال كلمة المرور'),
})

type UserForm = z.infer<typeof userSchema>
type EmployeeForm = z.infer<typeof employeeSchema>

type LoginType = 'user' | 'employee'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth: setUserAuth } = useAuthStore()
  const { setAuth: setEmployeeAuth } = useEmployeeAuthStore()
  const [loginType, setLoginType] = useState<LoginType>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const userForm = useForm<UserForm>({ resolver: zodResolver(userSchema) })
  const employeeForm = useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema) })

  const switchType = (type: LoginType) => {
    setLoginType(type)
    setError('')
    setShowPassword(false)
  }

  const onSubmitUser = async (data: UserForm) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.message || 'البيانات المدخلة غير صحيحة')
        return
      }
      setUserAuth(result.user, result.token)
      setAuthCookie('auth_token', result.token)
      router.push('/dashboard')
    } catch {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitEmployee = async (data: EmployeeForm) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.message || 'بيانات الدخول غير صحيحة')
        return
      }
      setEmployeeAuth(result.employee, result.token)
      setAuthCookie('employee_token', result.token)
      router.push('/dashboard')
    } catch {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[900px] flex bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden animate-in">
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 bg-gradient-to-b from-gray-50 to-white border-l border-gray-100">
        <div className="relative w-36 h-36 mb-6">
          <div className="w-full h-full rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center p-3">
            <img src="/ust-logo.png" alt="UST" className="w-full h-full object-contain" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary opacity-30 animate-spin" style={{ animationDuration: '12s' }} />
        </div>
        <h2 className="text-primary-dark text-lg font-bold">جامعة العلوم والتكنولوجيا</h2>
        <p className="text-gray-400 text-xs mt-2">بوابة إدارة النظام</p>
      </div>

      <div className="flex-[1.2] p-10 flex flex-col justify-center">
        <div className="md:hidden flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center p-2">
            <img src="/ust-logo.png" alt="UST" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-primary-dark text-center mb-1">تسجيل الدخول</h1>
        <p className="text-sm text-gray-500 text-center mb-6">نظام إدارة الجامعة</p>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => switchType('user')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              loginType === 'user'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Mail className="h-4 w-4" />
            مستخدم
          </button>
          <button
            type="button"
            onClick={() => switchType('employee')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              loginType === 'employee'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <User className="h-4 w-4" />
            موظف
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {loginType === 'user' ? (
          <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                {...userForm.register('email')}
                type="email"
                autoComplete="email"
                placeholder="البريد الإلكتروني"
                className="w-full h-12 pr-12 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {userForm.formState.errors.email && (
                <p className="text-xs text-danger mt-1">{userForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                {...userForm.register('password')}
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
              {userForm.formState.errors.password && (
                <p className="text-xs text-danger mt-1">{userForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full h-12 text-base">
              دخول
            </Button>
          </form>
        ) : (
          <form onSubmit={employeeForm.handleSubmit(onSubmitEmployee)} className="space-y-4">
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                {...employeeForm.register('employee_code')}
                type="text"
                autoComplete="username"
                placeholder="الكود الوظيفي"
                className="w-full h-12 pr-12 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {employeeForm.formState.errors.employee_code && (
                <p className="text-xs text-danger mt-1">{employeeForm.formState.errors.employee_code.message}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                {...employeeForm.register('password')}
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
              {employeeForm.formState.errors.password && (
                <p className="text-xs text-danger mt-1">{employeeForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full h-12 text-base">
              دخول
            </Button>
          </form>
        )}

        <p className="text-center text-[10px] text-gray-300 mt-8">
          جميع الحقوق محفوظة &copy; فريق الدعم الفني 2026
        </p>
      </div>
    </div>
  )
}
