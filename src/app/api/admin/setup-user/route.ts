import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const ALL_PAGE_KEYS = [
  'dashboard', 'messages', 'chatbot', 'reports', 'contact-messages',
  'university-config', 'university-events', 'university-news',
  'branches', 'colleges', 'departments', 'labs', 'study-levels', 'study-groups',
  'study-subjects', 'academic-semesters', 'study-schedules', 'master-timetable',
  'study-hours', 'programs', 'study-plans', 'subject-relations', 'buildings',
  'rooms', 'lectures', 'lectures-qr', 'lectures-attendance', 'faculty-preferences',
  'course-syllabi', 'time-slots',
  'problem-groups', 'default-problems',
  'requests', 'requests-reports', 'requests-oversight',
  'tasks', 'tasks-reports',
  'students', 'guardians', 'student-reports', 'student-enrollments', 'student-fees',
  'student-semester-gpa', 'academic-records', 'academic-warnings', 'academic-calendar',
  'scholarships', 'attendance-sessions', 'attendance-records', 'attendance-logs', 'attendance-reports',
  'exams', 'exam-schedules', 'exam-grades', 'exam-seating',
  'library-books', 'library-borrowings', 'library-fines', 'library-reservations',
  'fee-types', 'fee-payments',
  'admin-structures', 'job-titles', 'employees', 'employee-certificates',
  'employee-assignments', 'external-employees', 'job-openings',
  'documents', 'document-categories', 'contractor-documents',
  'contractors',
  'users', 'users-reports', 'users-profile',
  'roles', 'permissions', 'permissions-users', 'assign-permissions',
  'notifications', 'notification-templates',
  'system-settings', 'system-visuals', 'system-logs', 'backup', 'db-schema',
  'settings', 'logs', 'setup-workflow',
]

export async function POST() {
  try {
    const email = 'mohamed.mounir@ust.edu.ye'
    const fullName = 'محمد منير'
    const password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    let userId: number

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id
    } else {
      const insertUser = await query(
        `INSERT INTO users (full_name, email, password, status, view_personal_tasks, view_group_tasks)
         VALUES ($1, $2, $3, 1, 1, 1) RETURNING id`,
        [fullName, email, password]
      )
      userId = insertUser.rows[0].id
    }

    const existingPerm = await query(
      'SELECT id FROM user_permision WHERE user_id = $1 AND role_id = 2',
      [userId]
    )
    if (existingPerm.rows.length === 0) {
      await query(
        'INSERT INTO user_permision (user_id, role_id) VALUES ($1, 2) ON CONFLICT DO NOTHING',
        [userId]
      )
    }

    await query('DELETE FROM role_page_permissions WHERE role_id = 2')

    const values: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    for (const pageKey of ALL_PAGE_KEYS) {
      values.push(`(2, $${paramIdx}, 't', 't', 't', 't')`)
      params.push(pageKey)
      paramIdx++
    }

    await query(
      `INSERT INTO role_page_permissions (role_id, page_key, can_view, can_add, can_edit, can_delete)
       VALUES ${values.join(', ')}`,
      params
    )

    return NextResponse.json({
      success: true,
      message: 'تم إعداد المستخدم محمد منير بنجاح بصلاحيات كاملة',
      user_id: userId,
      email,
      pages_granted: ALL_PAGE_KEYS.length,
    })
  } catch (error) {
    console.error('Error setting up user:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
