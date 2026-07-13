import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_number, password } = body

    if (!student_number || !password) {
      return NextResponse.json(
        { success: false, message: 'الرجاء إدخال الرقم الجامعي وكلمة المرور' },
        { status: 400 }
      )
    }

    const result = await query(
      `SELECT s.*, c.college_name, d.department_name, sl.level_name, sg.group_name,
              sem.semester_name
       FROM students s
       LEFT JOIN colleges c ON c.id = s.college_id
       LEFT JOIN departments d ON d.id = s.department_id
       LEFT JOIN study_levels sl ON sl.id = s.study_level_id
       LEFT JOIN study_groups sg ON sg.id = s.study_group_id
       LEFT JOIN academic_semesters sem ON sem.id = s.academic_semester_id
       WHERE s.student_number = $1 LIMIT 1`,
      [student_number]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    const student = result.rows[0]

    if (!student.password) {
      return NextResponse.json(
        { success: false, error: 'لم يتم تعيين كلمة مرور لهذا الطالب' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, student.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    if (student.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'الحساب معطل، يرجى التواصل مع الإدارة' },
        { status: 403 }
      )
    }

    const token = signToken(
      { id: student.id, student_number: student.student_number, type: 'student' },
      '7d'
    )

    const { password: _, ...studentData } = student

    const res = NextResponse.json({
      success: true,
      student: studentData,
      token,
    })

    res.cookies.set('student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { success: false, error: 'خطأ في الاتصال بالخادم' },
      { status: 500 }
    )
  }
}
