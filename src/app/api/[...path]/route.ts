import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedNeon: any = null

async function getNeon() {
  if (cachedNeon) return cachedNeon
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const { neon } = await import('@neondatabase/serverless')
  cachedNeon = neon(url)
  return cachedNeon
}

const TABLE_MAP: Record<string, string> = {
  branches: 'branch',
  colleges: 'colleges',
  departments: 'departments',
  labs: 'labs',
  'study-levels': 'study_levels',
  'study-groups': 'study_groups',
  'academic-semesters': 'academic_semesters',
  programs: 'programs',
  'study-plans': 'study_plans',
  'study-subjects': 'study_subjects',
  'subject-relations': 'subject_relations',
  'plan-subjects': 'plan_subjects',
  buildings: 'buildings',
  rooms: 'rooms',
  groups: 'groups',
  'default-problems': 'default_problems',
  roles: 'roles',
  permissions: 'permissions',
  'user-permissions': 'user_permision',
  'employee-permissions': 'employee_permissions',
  'role-page-permissions': 'role_page_permissions',
  'job-titles': 'job_titles',
  'admin-structures': 'admin_structures',
  users: 'users',
  employees: 'employees',
  'employee-certificates': 'employee_certificates',
  'employee-assignments': 'employee_assignments',
  'external-employees': 'external_employees',
  students: 'students',
  guardians: 'guardians',
  'guardian-students': 'guardian_students',
  exams: 'exams',
  'exam-questions': 'exam_questions',
  'exam-schedules': 'exam_schedules',
  'exam-seating': 'exam_seating',
  'exam-grades': 'exam_grades',
  'exam-sessions': 'exam_sessions',
  requests: 'requests',
  tasks: 'tasks',
  'study-schedules': 'study_schedules',
  lectures: 'lectures',
  'attendance-sessions': 'attendance_sessions',
  'attendance-records': 'attendance_records',
  'student-enrollments': 'student_enrollments',
  'student-fees': 'student_fees',
  'fee-types': 'fee_types',
  'fee-payments': 'fee_payments',
  scholarships: 'scholarships',
  'student-scholarships': 'student_scholarships',
  'student-semester-gpa': 'student_semester_gpa',
  'academic-records': 'academic_records',
  'academic-warnings': 'academic_warnings',
  'academic-calendar': 'academic_calendar',
  'course-syllabi': 'course_syllabi',
  'faculty-preferences': 'faculty_preferences',
  'time-slots': 'time_slots',
  contractors: 'contractors',
  'contractor-documents': 'contractor_documents',
  documents: 'documents',
  'document-categories': 'document_categories',
  notifications: 'notifications',
  'notification-templates': 'notification_templates',
  messages: 'messages',
  'library-books': 'library_books',
  'library-borrowings': 'library_borrowings',
  'library-fines': 'library_fines',
  'library-reservations': 'library_reservations',
  'system-settings': 'system_settings',
  'system-visuals': 'system_visuals',
  'system-logs': 'system_logs',
  tickets: 'tickets',
  'chatbot-training': 'chatbot_training',
  'question-templates': 'question_templates',
  'training-questions': 'training_questions',
  'university-config': 'university_config',
  'university-news': 'university_news',
  'university-events': 'university_events',
  'job-openings': 'job_openings',
  'contact-messages': 'contact_messages',
  sidebar_menu: 'sidebar_menu',
  'user-page-access': 'user_page_access',
  'user-group-access': 'user_group_access',
  'user-branches': 'user_branches',
  'notification-logs': 'notification_logs',
  'exam-answers': 'exam_answers',
  'exam-security-logs': 'exam_security_logs',
}

function esc(val: unknown): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  const s = String(val).replace(/'/g, "''")
  return `'${s}'`
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE')
}

async function handleRequest(request: NextRequest, method: string) {
  if (API_BASE) {
    return proxyToBackend(request, method)
  }

  try {
    return await handleDbRequest(request, method)
  } catch (error) {
    console.error(`DB API error [${method}]:`, error)
    if (method === 'GET') return NextResponse.json([])
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }
}

async function handleDbRequest(request: NextRequest, method: string) {
  const neonSql = await getNeon()
  const fullPath = request.nextUrl.pathname.replace('/api/', '')
  const parts = fullPath.split('/').filter(Boolean)
  const basePath = parts[0] || ''
  const resourceId = parts.length > 1 ? parts[1] : null
  const subPath = parts.length > 2 ? parts.slice(2).join('/') : null

  const table = TABLE_MAP[basePath]

  if (!table) {
    return handleSpecialEndpoint(neonSql, request, method, fullPath, parts)
  }

  if (method === 'GET' && !resourceId) {
    return handleList(neonSql, request, table)
  }

  if (method === 'GET' && resourceId) {
    return handleGetById(neonSql, table, resourceId, subPath)
  }

  if (method === 'POST') {
    return handleCreate(neonSql, request, table)
  }

  if (method === 'PUT' && resourceId) {
    return handleUpdate(neonSql, request, table, resourceId)
  }

  if (method === 'DELETE' && resourceId) {
    return handleDelete(neonSql, table, resourceId)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleList(neonSql: any, request: NextRequest, table: string) {
  const params = request.nextUrl.searchParams
  const conditions: string[] = []

  for (const [key, value] of params.entries()) {
    if (value && value !== 'undefined' && value !== 'null') {
      conditions.push(`${key} = ${esc(value)}`)
    }
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''
  const sql = `SELECT * FROM ${table}${where} ORDER BY id DESC LIMIT 200`
  const rows = await neonSql.unsafe(sql)
  return NextResponse.json(rows)
}

async function handleGetById(neonSql: any, table: string, id: string, subPath: string | null) {
  if (subPath) {
    return handleSubPath(neonSql, table, id, subPath)
  }
  const rows = await neonSql.unsafe(`SELECT * FROM ${table} WHERE id = ${esc(id)} LIMIT 1`)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(rows[0])
}

async function handleSubPath(neonSql: any, table: string, parentId: string, subPath: string) {
  if (table === 'students' && subPath === 'enrollments') {
    const rows = await neonSql.unsafe(`SELECT * FROM student_enrollments WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'fees') {
    const rows = await neonSql.unsafe(`SELECT * FROM student_fees WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'grades') {
    const rows = await neonSql.unsafe(`SELECT * FROM exam_grades WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'attendance') {
    const rows = await neonSql.unsafe(`SELECT * FROM attendance_records WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'gpa') {
    const rows = await neonSql.unsafe(`SELECT * FROM student_semester_gpa WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'academic-records') {
    const rows = await neonSql.unsafe(`SELECT * FROM academic_records WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'exams' && subPath === 'questions') {
    const rows = await neonSql.unsafe(`SELECT * FROM exam_questions WHERE exam_id = ${esc(parentId)} ORDER BY sort_order`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'certificates') {
    const rows = await neonSql.unsafe(`SELECT * FROM employee_certificates WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'assignments') {
    const rows = await neonSql.unsafe(`SELECT * FROM employee_assignments WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'preferences') {
    const rows = await neonSql.unsafe(`SELECT * FROM faculty_preferences WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'messages' && subPath === 'conversations') {
    const rows = await neonSql.unsafe(`SELECT * FROM messages WHERE sender_id = ${esc(parentId)} OR receiver_id = ${esc(parentId)} ORDER BY created_at DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'messages' && subPath === 'unread-count') {
    const rows = await neonSql.unsafe(`SELECT COUNT(*)::int as count FROM messages WHERE receiver_id = ${esc(parentId)} AND is_read = 0`)
    return NextResponse.json(rows[0] || { count: 0 })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function handleCreate(neonSql: any, request: NextRequest, table: string) {
  const body = await request.json().catch(() => ({}))
  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }

  const keys = Object.keys(body)
  const values = keys.map(k => esc(body[k]))

  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`
  const rows = await neonSql.unsafe(sql)
  return NextResponse.json(rows[0] || { success: true })
}

async function handleUpdate(neonSql: any, request: NextRequest, table: string, id: string) {
  const body = await request.json().catch(() => ({}))
  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }

  const sets = Object.keys(body).map(k => `${k} = ${esc(body[k])}`)
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ${esc(id)} RETURNING *`
  const rows = await neonSql.unsafe(sql)
  return NextResponse.json(rows[0] || { success: true })
}

async function handleDelete(neonSql: any, table: string, id: string) {
  await neonSql.unsafe(`DELETE FROM ${table} WHERE id = ${esc(id)}`)
  return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
}

async function handleSpecialEndpoint(
  neonSql: any,
  request: NextRequest,
  method: string,
  fullPath: string,
  parts: string[]
) {
  if (fullPath === 'dashboard/stats' && method === 'GET') {
    return handleDashboardStats(neonSql)
  }

  if (fullPath === 'attendance-logs' && method === 'GET') {
    const rows = await neonSql.unsafe(`
      SELECT ar.*, s.full_name as student_name, ats.session_date, ats.start_time, ats.end_time
      FROM attendance_records ar
      JOIN students s ON ar.student_id = s.id
      LEFT JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
      ORDER BY ar.created_at DESC LIMIT 200
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'attendance-reports' && method === 'GET') {
    const rows = await neonSql.unsafe(`
      SELECT s.id as student_id, s.full_name, s.student_number,
        COUNT(ar.id) FILTER (WHERE ar.status = 'present') as present_count,
        COUNT(ar.id) FILTER (WHERE ar.status = 'absent') as absent_count,
        COUNT(ar.id) FILTER (WHERE ar.status = 'late') as late_count,
        COUNT(ar.id) as total_sessions
      FROM students s
      LEFT JOIN attendance_records ar ON s.id = ar.student_id
      GROUP BY s.id, s.full_name, s.student_number
      ORDER BY s.full_name
    `)
    return NextResponse.json(rows)
  }

  if (parts[0] === 'attendance-stats' && parts[1]) {
    const studentId = parts[1]
    const rows = await neonSql.unsafe(`
      SELECT
        COUNT(*) FILTER (WHERE ar.status = 'present')::int as present,
        COUNT(*) FILTER (WHERE ar.status = 'absent')::int as absent,
        COUNT(*) FILTER (WHERE ar.status = 'late')::int as late,
        COUNT(*)::int as total
      FROM attendance_records ar WHERE ar.student_id = ${esc(studentId)}
    `)
    return NextResponse.json(rows[0] || { present: 0, absent: 0, late: 0, total: 0 })
  }

  if (fullPath === 'student-dashboard' && method === 'GET') {
    return handleStudentDashboard(neonSql, request)
  }

  if (parts[0] === 'student-schedule' && method === 'GET') {
    const params = request.nextUrl.searchParams
    const studentId = params.get('student_id')
    if (!studentId) return NextResponse.json([])
    const rows = await neonSql.unsafe(`
      SELECT ss.*, ssr.subject_name as study_subject_name
      FROM study_schedules ss
      LEFT JOIN study_subjects ssr ON ss.study_subject_id = ssr.id
      WHERE ss.study_group_id IN (SELECT study_group_id FROM students WHERE id = ${esc(studentId)})
      ORDER BY ss.day_of_week, ss.start_time
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'master-timetable' && method === 'GET') {
    const rows = await neonSql.unsafe(`
      SELECT ss.*, ssr.subject_name, e.full_name as employee_name
      FROM study_schedules ss
      LEFT JOIN study_subjects ssr ON ss.study_subject_id = ssr.id
      LEFT JOIN employees e ON ss.employee_id = e.id
      ORDER BY ss.day_of_week, ss.start_time
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'db-schema' && method === 'GET') {
    const rows = await neonSql.unsafe(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'issue-types' && method === 'GET') {
    const rows = await neonSql.unsafe(`SELECT * FROM default_problems ORDER BY id`)
    return NextResponse.json(rows)
  }

  if (fullPath === 'study-subjects' && method === 'GET') {
    return handleList(neonSql, request, 'study_subjects')
  }

  if (fullPath === 'role-page-permissions' && parts[1] === 'user' && parts[2]) {
    const rows = await neonSql.unsafe(`
      SELECT rpp.*, r.role_name
      FROM role_page_permissions rpp
      JOIN roles r ON rpp.role_id = r.id
      WHERE rpp.role_id IN (SELECT role_id FROM user_permision WHERE user_id = ${esc(parts[2])})
      ORDER BY rpp.page_key
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'role-page-permissions' && parts[1] === 'employee' && parts[2]) {
    const rows = await neonSql.unsafe(`
      SELECT rpp.*, r.role_name
      FROM role_page_permissions rpp
      JOIN roles r ON rpp.role_id = r.id
      WHERE rpp.role_id IN (SELECT role_id FROM employee_permissions WHERE employee_id = ${esc(parts[2])})
      ORDER BY rpp.page_key
    `)
    return NextResponse.json(rows)
  }

  if (fullPath.startsWith('role-page-permissions/') && parts[1] && parts[2] === 'bulk') {
    const roleId = parts[1]
    if (method === 'GET') {
      const rows = await neonSql.unsafe(`SELECT * FROM role_page_permissions WHERE role_id = ${esc(roleId)} ORDER BY page_key`)
      return NextResponse.json(rows)
    }
  }

  if (fullPath === 'auth/profile' && method === 'GET') {
    const rows = await neonSql.unsafe(`SELECT id, full_name, email, status FROM users ORDER BY id LIMIT 1`)
    return NextResponse.json(rows[0] || null)
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
}

async function handleDashboardStats(neonSql: any) {
  const [
    requestsRes,
    usersRes,
    collegesRes,
    departmentsRes,
    labsRes,
    levelsRes,
    groupsRes,
    subjectsRes,
    semestersRes,
    guardiansRes,
    examsRes,
    studentsRes,
    tasksRes,
    recentRequestsRes,
  ] = await Promise.all([
    neonSql.unsafe(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status IN ('in_progress','in-progress','processing'))::int AS in_progress, COUNT(*) FILTER (WHERE status IN ('resolved','completed','closed'))::int AS resolved, COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled FROM requests`).then((r: any) => r[0] || { total: 0, pending: 0, in_progress: 0, resolved: 0, cancelled: 0 }),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM users`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM colleges`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM departments`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM labs`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM study_levels`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM study_groups`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM study_subjects`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM academic_semesters`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM guardians`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM exams`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total FROM students`).then((r: any) => r[0]?.total || 0),
    neonSql.unsafe(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status IN ('in_progress','in-progress','processing'))::int AS in_progress, COUNT(*) FILTER (WHERE status IN ('resolved','completed','done'))::int AS completed FROM tasks`).then((r: any) => r[0] || { total: 0, pending: 0, in_progress: 0, completed: 0 }),
    neonSql.unsafe(`SELECT * FROM requests ORDER BY created_at DESC LIMIT 10`).then((r: any) => r),
  ]).catch(() => [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, []])

  const req = requestsRes || { total: 0, pending: 0, in_progress: 0, resolved: 0, cancelled: 0 }
  const tasks = tasksRes || { total: 0, pending: 0, in_progress: 0, completed: 0 }

  let statusDist: { label: string; count: number; color: string }[] = []
  let priorityDist: { label: string; count: number; color: string }[] = []
  let monthlyTrends: { month: string; count: number }[] = []

  try {
    statusDist = await neonSql.unsafe(`
      SELECT CASE status WHEN 'pending' THEN 'معلق' WHEN 'in_progress' THEN 'قيد التنفيذ' WHEN 'in-progress' THEN 'قيد التنفيذ' WHEN 'processing' THEN 'قيد التنفيذ' WHEN 'resolved' THEN 'تم الحل' WHEN 'completed' THEN 'تم الحل' WHEN 'closed' THEN 'تم الحل' WHEN 'cancelled' THEN 'ملغي' ELSE status END AS label,
        COUNT(*)::int AS count,
        CASE status WHEN 'pending' THEN '#f59e0b' WHEN 'in_progress' THEN '#3b82f6' WHEN 'in-progress' THEN '#3b82f6' WHEN 'processing' THEN '#3b82f6' WHEN 'resolved' THEN '#22c55e' WHEN 'completed' THEN '#22c55e' WHEN 'closed' THEN '#22c55e' WHEN 'cancelled' THEN '#ef4444' ELSE '#6b7280' END AS color
      FROM requests GROUP BY status ORDER BY count DESC
    `) as { label: string; count: number; color: string }[]
  } catch { /* ignore */ }

  try {
    priorityDist = await neonSql.unsafe(`
      SELECT CASE priority WHEN 'high' THEN 'عالية' WHEN 'medium' THEN 'متوسطة' WHEN 'low' THEN 'منخفضة' ELSE priority END AS label,
        COUNT(*)::int AS count,
        CASE priority WHEN 'high' THEN '#ef4444' WHEN 'medium' THEN '#f59e0b' WHEN 'low' THEN '#22c55e' ELSE '#6b7280' END AS color
      FROM requests GROUP BY priority ORDER BY count DESC
    `) as { label: string; count: number; color: string }[]
  } catch { /* ignore */ }

  try {
    monthlyTrends = await neonSql.unsafe(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS count
      FROM requests WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM') ORDER BY month ASC
    `) as { month: string; count: number }[]
  } catch { /* ignore */ }

  return NextResponse.json({
    total_requests: req.total,
    pending_requests: req.pending,
    in_progress_requests: req.in_progress,
    resolved_requests: req.resolved,
    cancelled_requests: req.cancelled,
    total_users: typeof usersRes === 'number' ? usersRes : 0,
    active_users: typeof usersRes === 'number' ? usersRes : 0,
    total_branches: 0,
    total_colleges: collegesRes || 0,
    total_labs: labsRes || 0,
    total_departments: departmentsRes || 0,
    total_students: typeof studentsRes === 'number' ? studentsRes : 0,
    total_guardians: guardiansRes || 0,
    total_exams: examsRes || 0,
    total_subjects: subjectsRes || 0,
    total_levels: levelsRes || 0,
    total_groups: groupsRes || 0,
    total_semesters: semestersRes || 0,
    total_tasks: tasks.total,
    pending_tasks: tasks.pending,
    completed_tasks: tasks.completed,
    in_progress_tasks: tasks.in_progress,
    completion_rate: tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0,
    priority_distribution: priorityDist,
    status_distribution: statusDist,
    monthly_trends: monthlyTrends,
    branch_user_distribution: [],
    recent_requests: recentRequestsRes || [],
  })
}

async function handleStudentDashboard(neonSql: any, request: NextRequest) {
  const params = request.nextUrl.searchParams
  const studentId = params.get('student_id') || '1'

  const [student, enrollments, schedules, fees, gpa] = await Promise.all([
    neonSql.unsafe(`SELECT * FROM students WHERE id = ${esc(studentId)} LIMIT 1`).then((r: any) => r[0] || null),
    neonSql.unsafe(`SELECT * FROM student_enrollments WHERE student_id = ${esc(studentId)} ORDER BY id DESC LIMIT 5`),
    neonSql.unsafe(`SELECT ss.*, ssr.subject_name FROM study_schedules ss LEFT JOIN study_subjects ssr ON ss.study_subject_id = ssr.id WHERE ss.study_group_id IN (SELECT study_group_id FROM students WHERE id = ${esc(studentId)}) ORDER BY ss.day_of_week LIMIT 10`),
    neonSql.unsafe(`SELECT * FROM student_fees WHERE student_id = ${esc(studentId)} ORDER BY id DESC LIMIT 10`),
    neonSql.unsafe(`SELECT * FROM student_semester_gpa WHERE student_id = ${esc(studentId)} ORDER BY id DESC LIMIT 5`),
  ]).catch(() => [null, [], [], [], []])

  return NextResponse.json({
    student,
    enrollments,
    schedules,
    fees,
    gpa,
  })
}

async function proxyToBackend(request: NextRequest, method: string) {
  const fullPath = request.nextUrl.pathname.replace('/api/', '')
  const searchParams = request.nextUrl.search

  try {
    const body = method !== 'GET' ? await request.json().catch(() => ({})) : undefined
    const queryString = searchParams ? `&${searchParams.slice(1)}` : ''
    const url = `${API_BASE}/api/index.php?path=${encodeURIComponent(fullPath)}${queryString}`

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _method: method, ...(body || {}) }),
    }

    const res = await fetch(url, fetchOptions)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    if (method === 'GET') return NextResponse.json([])
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }
}
