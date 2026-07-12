import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ust-next-secret-key-2026'

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, message: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT id, full_name, email, password, status FROM users WHERE email = $1 LIMIT 1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'البيانات المدخلة غير صحيحة' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'البيانات المدخلة غير صحيحة' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'البيانات المدخلة غير صحيحة' },
        { status: 401 }
      )
    }

    if (user.status === 0 || user.status === 'inactive') {
      return NextResponse.json(
        { success: false, message: 'الحساب معطل، يرجى التواصل مع الإدارة' },
        { status: 403 }
      )
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      token,
    })

    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (error) {
    console.error('Login error:', error)
    const detail = error instanceof Error ? error.message : 'unknown'
    return NextResponse.json(
      { success: false, message: 'خطأ في الاتصال بالخادم', detail },
      { status: 500 }
    )
  }
}
