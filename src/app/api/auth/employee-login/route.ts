import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employee_code, password } = body

    if (!employee_code || !password) {
      return NextResponse.json(
        { success: false, message: 'الرجاء إدخال الكود الوظيفي وكلمة المرور' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT e.id, e.employee_code, e.full_name, e.email, e.phone, e.password, e.status,
              e.academic_degree, e.specialization,
              jt.title AS job_title_name,
              ast.name AS admin_structure_name
       FROM employees e
       LEFT JOIN job_titles jt ON jt.id = e.job_title_id
       LEFT JOIN admin_structures ast ON ast.id = e.admin_structure_id
       WHERE e.employee_code = $1 LIMIT 1`,
      [employee_code]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    const employee = result.rows[0]

    if (!employee.password) {
      return NextResponse.json(
        { success: false, message: 'لم يتم تعيين كلمة مرور لهذا الموظف' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, employee.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    if (employee.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'الحساب معطل، يرجى التواصل مع الإدارة' },
        { status: 403 }
      )
    }

    const token = signToken(
      { id: employee.id, employee_code: employee.employee_code, type: 'employee' },
      '7d'
    )

    const res = NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone,
        academic_degree: employee.academic_degree,
        specialization: employee.specialization,
        job_title_name: employee.job_title_name,
        admin_structure_name: employee.admin_structure_name,
      },
      token,
    })

    res.cookies.set('employee_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (error) {
    console.error('Employee login error:', error)
    return NextResponse.json(
      { success: false, message: 'خطأ في الاتصال بالخادم' },
      { status: 500 }
    )
  }
}
