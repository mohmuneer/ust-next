import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const API_BASE = process.env.API_BASE_URL

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ust-next-dev-secret-only-for-local-development'
)

type AuthUser = { id: number; type: 'student' | 'employee' | 'user' }

async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return { id: payload.id as number, type: payload.type as AuthUser['type'] }
    } catch { /* invalid token */ }
  }

  const cookieMap: Record<string, AuthUser['type']> = {
    student_token: 'student',
    employee_token: 'employee',
    auth_token: 'user',
  }

  for (const [cookieName, userType] of Object.entries(cookieMap)) {
    const token = request.cookies.get(cookieName)?.value
    if (!token) continue
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (payload.type === userType) {
        return { id: payload.id as number, type: userType }
      }
    } catch { /* invalid token */ }
  }

  return null
}

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

  const fullPath = request.nextUrl.pathname.replace('/api/', '')
  const parts = fullPath.split('/').filter(Boolean)
  const basePath = parts[0] || ''

  const skipAuth = basePath === 'auth' || basePath === 'system-settings' || fullPath.startsWith('system-settings')

  if (!skipAuth) {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول', code: 'UNAUTHORIZED' }, { status: 401 })
    }
    ;(request as any)._authUser = user
  }

  try {
    return await handleDbRequest(request, method)
  } catch (error) {
    console.error(`DB API error [${method}]:`, error)
    if (method === 'GET') return NextResponse.json([])
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

async function handleDbRequest(request: NextRequest, method: string) {
  const neonSql = await getNeon()
  const fullPath = request.nextUrl.pathname.replace('/api/', '')
  const parts = fullPath.split('/').filter(Boolean)
  const basePath = parts[0] || ''
  const resourceId = parts.length > 1 ? parts[1] : null
  const subPath = parts.length > 2 ? parts.slice(2).join('/') : null

  if (fullPath === 'messages/conversations' && method === 'GET') {
    return handleConversations(neonSql, request)
  }
  if (fullPath === 'messages/unread-count' && method === 'GET') {
    return handleUnreadCount(neonSql, request)
  }
  if (basePath === 'messages' && resourceId && resourceId === 'users' && subPath === 'search' && method === 'GET') {
    return handleUserSearch(neonSql, request)
  }
  if (basePath === 'messages' && resourceId && resourceId === 'search' && method === 'GET') {
    return handleMessageSearch(neonSql, request)
  }
  if (basePath === 'messages' && resourceId === 'groups' && method === 'GET') {
    return handleGroups(neonSql, request, method)
  }
  if (basePath === 'messages' && resourceId === 'groups' && method === 'POST') {
    return handleGroups(neonSql, request, method)
  }
  if (basePath === 'messages' && resourceId === 'groups' && parts[2] === 'members' && method === 'GET') {
    return handleGroupMembers(neonSql, parts[1])
  }
  if (basePath === 'messages' && resourceId === 'presence' && method === 'PUT') {
    return handlePresence(neonSql, request, method)
  }
  if (basePath === 'messages' && resourceId === 'presence' && parts[2] && method === 'GET') {
    return handlePresenceGet(neonSql, parts[2])
  }
  if (basePath === 'messages' && resourceId === 'group' && parts[2] && parts[3] === 'read' && method === 'PUT') {
    return handleMarkGroupAsRead(neonSql, parts[2], request)
  }
  if (basePath === 'messages' && resourceId === 'group' && parts[2] && method === 'GET') {
    return handleGroupMessages(neonSql, parts[2])
  }
  if (basePath === 'messages' && resourceId && resourceId !== 'conversations' && resourceId !== 'unread-count' && resourceId !== 'users' && resourceId !== 'search' && resourceId !== 'groups' && resourceId !== 'presence' && resourceId !== 'group' && parts.length === 3 && parts[2] === 'read' && method === 'PUT') {
    return handleMarkAsRead(neonSql, resourceId, request)
  }
  if (basePath === 'messages' && resourceId && resourceId !== 'conversations' && resourceId !== 'unread-count' && resourceId !== 'users' && resourceId !== 'search' && resourceId !== 'groups' && resourceId !== 'presence' && resourceId !== 'group' && !subPath && method === 'GET') {
    return handleMessagesThread(neonSql, resourceId)
  }
  if (basePath === 'messages' && method === 'POST') {
    return handleSendMessage(neonSql, request)
  }

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
  const rows = await neonSql.query(sql)
  return NextResponse.json(rows)
}

async function handleGetById(neonSql: any, table: string, id: string, subPath: string | null) {
  if (subPath) {
    return handleSubPath(neonSql, table, id, subPath)
  }
  const rows = await neonSql.query(`SELECT * FROM ${table} WHERE id = ${esc(id)} LIMIT 1`)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(rows[0])
}

async function handleSubPath(neonSql: any, table: string, parentId: string, subPath: string) {
  if (table === 'students' && subPath === 'enrollments') {
    const rows = await neonSql.query(`SELECT * FROM student_enrollments WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'fees') {
    const rows = await neonSql.query(`SELECT * FROM student_fees WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'grades') {
    const rows = await neonSql.query(`SELECT * FROM exam_grades WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'attendance') {
    const rows = await neonSql.query(`SELECT * FROM attendance_records WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'gpa') {
    const rows = await neonSql.query(`SELECT * FROM student_semester_gpa WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'students' && subPath === 'academic-records') {
    const rows = await neonSql.query(`SELECT * FROM academic_records WHERE student_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'exams' && subPath === 'questions') {
    const rows = await neonSql.query(`SELECT * FROM exam_questions WHERE exam_id = ${esc(parentId)} ORDER BY sort_order`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'certificates') {
    const rows = await neonSql.query(`SELECT * FROM employee_certificates WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'assignments') {
    const rows = await neonSql.query(`SELECT * FROM employee_assignments WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
  }
  if (table === 'employees' && subPath === 'preferences') {
    const rows = await neonSql.query(`SELECT * FROM faculty_preferences WHERE employee_id = ${esc(parentId)} ORDER BY id DESC`)
    return NextResponse.json(rows)
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
  const rows = await neonSql.query(sql)
  return NextResponse.json(rows[0] || { success: true })
}

async function handleUpdate(neonSql: any, request: NextRequest, table: string, id: string) {
  const body = await request.json().catch(() => ({}))
  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }

  const sets = Object.keys(body).map(k => `${k} = ${esc(body[k])}`)
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ${esc(id)} RETURNING *`
  const rows = await neonSql.query(sql)
  return NextResponse.json(rows[0] || { success: true })
}

async function handleDelete(neonSql: any, table: string, id: string) {
  await neonSql.query(`DELETE FROM ${table} WHERE id = ${esc(id)}`)
  return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
}

async function handleConversations(neonSql: any, request: NextRequest) {
  const params = request.nextUrl.searchParams
  const userId = params.get('user_id') || '10'

  let directConvos: any[] = []
  let groupConvos: any[] = []

  try {
    directConvos = await neonSql.query(`
      WITH latest_messages AS (
        SELECT
          CASE WHEN sender_id = ${esc(userId)} THEN receiver_id ELSE sender_id END AS other_user_id,
          message_text AS last_message,
          message_type AS last_message_type,
          created_at,
          is_read,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN sender_id = ${esc(userId)} THEN receiver_id ELSE sender_id END
            ORDER BY created_at DESC
          ) AS rn
        FROM messages
        WHERE (sender_id = ${esc(userId)} OR receiver_id = ${esc(userId)})
          AND group_id IS NULL AND is_deleted = FALSE
      ),
      other_info AS (
        SELECT
          lm.*,
          COALESCE(s.full_name, e.full_name, u.full_name, 'مستخدم ' || lm.other_user_id) AS full_name,
          COALESCE(s.photo, u.file_path) AS file_path,
          CASE WHEN s.id IS NOT NULL THEN 'student' WHEN e.id IS NOT NULL THEN 'employee' ELSE 'admin' END AS role
        FROM latest_messages lm
        LEFT JOIN students s ON s.id = lm.other_user_id
        LEFT JOIN employees e ON e.id = lm.other_user_id
        LEFT JOIN users u ON u.id = lm.other_user_id
        WHERE lm.rn = 1
      )
      SELECT
        oi.other_user_id AS id,
        'direct' AS type,
        oi.last_message,
        oi.last_message_type,
        oi.created_at,
        oi.is_read,
        oi.full_name,
        oi.file_path,
        oi.role,
        (SELECT COUNT(*)::int FROM messages WHERE sender_id = oi.other_user_id AND receiver_id = ${esc(userId)} AND is_read = 0 AND is_deleted = FALSE) AS unread_count
      FROM other_info oi
      ORDER BY oi.created_at DESC
    `) as any[]
  } catch { directConvos = [] }

  try {
    groupConvos = await neonSql.query(`
      SELECT
        cg.id,
        'group' AS type,
        '' AS last_message,
        'text' AS last_message_type,
        cg.created_at AS created_at,
        TRUE AS is_read,
        cg.name AS full_name,
        cg.avatar_url AS file_path,
        (SELECT COUNT(*)::int FROM chat_group_members WHERE group_id = cg.id) AS member_count,
        COALESCE(cgm.is_pinned, FALSE) AS is_pinned,
        COALESCE(cgm.is_muted, FALSE) AS is_muted
      FROM chat_groups cg
      LEFT JOIN chat_group_members cgm ON cgm.group_id = cg.id AND cgm.user_id = ${esc(userId)}
      WHERE cgm.user_id IS NOT NULL AND cg.is_archived = FALSE
      ORDER BY cg.name
    `) as any[]
  } catch { groupConvos = [] }

  const all = [...directConvos, ...groupConvos]
  all.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(all)
}

async function handleUnreadCount(neonSql: any, request: NextRequest) {
  const params = request.nextUrl.searchParams
  const userId = params.get('user_id') || '10'
  const rows = await neonSql.query(`
    SELECT COUNT(*)::int as count FROM messages WHERE receiver_id = ${esc(userId)} AND is_read = 0
  `) as any[]
  return NextResponse.json(rows[0] || { count: 0 })
}

async function handleMessagesThread(neonSql: any, otherUserId: string) {
  const params = new URLSearchParams()
  const rows = await neonSql.query(`
    SELECT
      m.*,
      COALESCE(s.full_name, u.full_name, 'مستخدم ' || m.sender_id) AS full_name,
      u.file_path,
      rm.message_text AS reply_to_text,
      COALESCE(rs.full_name, ru.full_name, '') AS reply_to_sender
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    LEFT JOIN students s ON s.id = m.sender_id
    LEFT JOIN employees e ON e.id = m.sender_id
    LEFT JOIN messages rm ON rm.id = m.reply_to_id
    LEFT JOIN users ru ON ru.id = rm.sender_id
    LEFT JOIN students rs ON rs.id = rm.sender_id
    WHERE ((m.sender_id = ${esc(otherUserId)} OR m.receiver_id = ${esc(otherUserId)}) AND m.group_id IS NULL)
      AND m.is_deleted = FALSE
    ORDER BY m.created_at ASC
  `) as any[]
  return NextResponse.json(rows)
}

async function handleGroupMessages(neonSql: any, groupId: string) {
  const rows = await neonSql.query(`
    SELECT
      m.*,
      COALESCE(s.full_name, u.full_name, 'مستخدم ' || m.sender_id) AS full_name,
      u.file_path,
      rm.message_text AS reply_to_text,
      COALESCE(rs.full_name, ru.full_name, '') AS reply_to_sender
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    LEFT JOIN students s ON s.id = m.sender_id
    LEFT JOIN employees e ON e.id = m.sender_id
    LEFT JOIN messages rm ON rm.id = m.reply_to_id
    LEFT JOIN users ru ON ru.id = rm.sender_id
    LEFT JOIN students rs ON rs.id = rm.sender_id
    WHERE m.group_id = ${esc(groupId)} AND m.is_deleted = FALSE
    ORDER BY m.created_at ASC
  `) as any[]
  return NextResponse.json(rows)
}

async function handleSendMessage(neonSql: any, request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const senderId = body.sender_id || 10
  const receiverId = body.receiver_id || null
  const groupId = body.group_id || null
  const messageText = body.message_text || body.message || ''
  const messageType = body.message_type || 'text'
  const replyToId = body.reply_to_id || null
  const attachmentUrl = body.attachment_url || null
  const attachmentName = body.attachment_name || null
  const attachmentType = body.attachment_type || null
  const attachmentSize = body.attachment_size || null
  const clientMessageId = body.client_message_id || null

  if (!messageText && !attachmentUrl) {
    return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 })
  }

  if (clientMessageId) {
    const existing = await neonSql.query(
      `SELECT * FROM messages WHERE client_message_id = $1 LIMIT 1`,
      [clientMessageId]
    ) as any
    const existingRows = existing?.rows || existing || []
    if (existingRows.length > 0) {
      return NextResponse.json({ success: true, data: existingRows[0] })
    }
  }

  const hasCol = await neonSql.query(
    `SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='client_message_id') as exists`
  ) as any
  const colExists = (hasCol?.rows?.[0] || hasCol?.[0])?.exists

  if (colExists) {
    const sql = `INSERT INTO messages (client_message_id, sender_id, receiver_id, group_id, message_text, message_type, reply_to_id, attachment_url, attachment_name, attachment_type, attachment_size, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, NOW())
      RETURNING *`
    const params = [clientMessageId, senderId, receiverId, groupId, messageText, messageType, replyToId, attachmentUrl, attachmentName, attachmentType, attachmentSize]
    const result = await neonSql.query(sql, params) as any
    const rows = result?.rows || result || []
    return NextResponse.json({ success: true, data: rows[0] || {} })
  } else {
    const sql = `INSERT INTO messages (sender_id, receiver_id, group_id, message_text, message_type, reply_to_id, attachment_url, attachment_name, attachment_type, attachment_size, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, NOW())
      RETURNING *`
    const params = [senderId, receiverId, groupId, messageText, messageType, replyToId, attachmentUrl, attachmentName, attachmentType, attachmentSize]
    const result = await neonSql.query(sql, params) as any
    const rows = result?.rows || result || []
    return NextResponse.json({ success: true, data: rows[0] || {} })
  }
}

async function handleMarkAsRead(neonSql: any, otherUserId: string, request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const readerId = body.reader_id || 10
  await neonSql.query(`
    UPDATE messages SET is_read = 1
    WHERE sender_id = ${esc(otherUserId)} AND receiver_id = ${esc(readerId)} AND is_read = 0
  `)
  return NextResponse.json({ success: true })
}

async function handleMarkGroupAsRead(neonSql: any, groupId: string, request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = body.user_id || 10
  await neonSql.query(`
    UPDATE chat_group_members SET last_read_at = NOW() WHERE group_id = ${esc(groupId)} AND user_id = ${esc(userId)}
  `)
  return NextResponse.json({ success: true })
}

async function handleUserSearch(neonSql: any, request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = params.get('q') || ''
  const userId = params.get('user_id') || '10'
  if (!q || q.length < 2) return NextResponse.json([])

  const likeClause = `ILIKE ${esc('%' + q + '%')}`
  const rows = await neonSql.query(`
    SELECT id, full_name, email, file_path, 'student' AS role, college_name, department_name, '' AS job_title FROM (
      SELECT s.id, s.full_name, s.email, s.photo AS file_path, c.college_name, d.department_name
      FROM students s
      LEFT JOIN colleges c ON c.id = s.college_id
      LEFT JOIN departments d ON d.id = s.department_id
      WHERE s.full_name ${likeClause}
      UNION ALL
      SELECT e.id, e.full_name, e.email, NULL AS file_path, '' AS college_name, '' AS department_name
      FROM employees e
      WHERE e.full_name ${likeClause}
      UNION ALL
      SELECT u.id, u.full_name, u.email, u.file_path, '' AS college_name, '' AS department_name
      FROM users u
      WHERE u.full_name ${likeClause} AND u.id != ${esc(userId)}
    ) combined
    WHERE id != ${esc(userId)}
    ORDER BY full_name
    LIMIT 20
  `) as any[]
  return NextResponse.json(rows)
}

async function handleMessageSearch(neonSql: any, request: NextRequest) {
  const params = request.nextUrl.searchParams
  const q = params.get('q') || ''
  const userId = params.get('user_id') || '10'
  if (!q || q.length < 2) return NextResponse.json([])

  const rows = await neonSql.query(`
    SELECT m.*, COALESCE(s.full_name, u.full_name, '') AS full_name, u.file_path
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    LEFT JOIN students s ON s.id = m.sender_id
    WHERE (m.sender_id = ${esc(userId)} OR m.receiver_id = ${esc(userId)})
      AND m.message_text ILIKE ${esc('%' + q + '%')}
      AND m.is_deleted = FALSE
    ORDER BY m.created_at DESC
    LIMIT 50
  `) as any[]
  return NextResponse.json(rows)
}

async function handleGroups(neonSql: any, request: NextRequest, method: string) {
  const params = request.nextUrl.searchParams
  const userId = params.get('user_id') || '10'

  if (method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const name = body.name
    const description = body.description || ''
    const createdBy = body.created_by || userId
    const memberIds: number[] = body.member_ids || []

    if (!name) return NextResponse.json({ success: false, error: 'name required' }, { status: 400 })

    const groupRows = await neonSql.query(`
      INSERT INTO chat_groups (name, description, created_by, group_type, created_at, updated_at)
      VALUES (${esc(name)}, ${esc(description)}, ${esc(createdBy)}, 'general', NOW(), NOW())
      RETURNING *
    `) as any[]
    const group = groupRows[0]

    await neonSql.query(`
      INSERT INTO chat_group_members (group_id, user_id, role, joined_at)
      VALUES (${esc(group.id)}, ${esc(createdBy)}, 'admin', NOW())
    `)

    for (const memberId of memberIds) {
      if (memberId !== createdBy) {
        await neonSql.query(`
          INSERT INTO chat_group_members (group_id, user_id, role, joined_at)
          VALUES (${esc(group.id)}, ${esc(memberId)}, 'member', NOW())
        `)
      }
    }

    return NextResponse.json({ success: true, data: group })
  }

  const rows = await neonSql.query(`
    SELECT cg.*,
      (SELECT COUNT(*)::int FROM chat_group_members WHERE group_id = cg.id) AS member_count
    FROM chat_groups cg
    JOIN chat_group_members cgm ON cgm.group_id = cg.id AND cgm.user_id = ${esc(userId)}
    WHERE cg.is_archived = FALSE
    ORDER BY cg.name
  `) as any[]
  return NextResponse.json(rows)
}

async function handleGroupMembers(neonSql: any, groupId: string) {
  const rows = await neonSql.query(`
    SELECT cgm.*,
      COALESCE(s.full_name, e.full_name, u.full_name) AS full_name,
      u.file_path
    FROM chat_group_members cgm
    LEFT JOIN users u ON u.id = cgm.user_id
    LEFT JOIN students s ON s.id = cgm.user_id
    LEFT JOIN employees e ON e.id = cgm.user_id
    WHERE cgm.group_id = ${esc(groupId)}
    ORDER BY cgm.role, cgm.joined_at
  `) as any[]
  return NextResponse.json(rows)
}

async function handlePresence(neonSql: any, request: NextRequest, method: string) {
  if (method === 'PUT') {
    const body = await request.json().catch(() => ({}))
    const userId = body.user_id || 10
    const isOnline = body.is_online ?? true
    await neonSql.query(`
      INSERT INTO user_presence (user_id, is_online, last_seen, updated_at)
      VALUES (${esc(userId)}, ${esc(isOnline)}, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET is_online = ${esc(isOnline)}, last_seen = NOW(), updated_at = NOW()
    `)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

async function handlePresenceGet(neonSql: any, userId: string) {
  const rows = await neonSql.query(`
    SELECT * FROM user_presence WHERE user_id = ${esc(userId)}
  `) as any[]
  return NextResponse.json(rows[0] || { user_id: userId, is_online: false, last_seen: null })
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
    const rows = await neonSql.query(`
      SELECT ar.*, s.full_name as student_name, ats.session_date, ats.start_time, ats.end_time
      FROM attendance_records ar
      JOIN students s ON ar.student_id = s.id
      LEFT JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
      ORDER BY ar.created_at DESC LIMIT 200
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'attendance-reports' && method === 'GET') {
    const params = request.nextUrl.searchParams
    const conditions: string[] = []
    const dateFrom = params.get('date_from')
    const dateTo = params.get('date_to')
    const subjectId = params.get('subject_id')
    const employeeId = params.get('employee_id')
    if (dateFrom) conditions.push(`ats.session_date >= '${dateFrom}'`)
    if (dateTo) conditions.push(`ats.session_date <= '${dateTo}'`)
    if (subjectId) conditions.push(`ats.study_subject_id = ${esc(subjectId)}`)
    if (employeeId) conditions.push(`ats.employee_id = ${esc(employeeId)}`)
    const where = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : ''

    const summaryRows = await neonSql.query(`
      SELECT
        COUNT(DISTINCT ats.id)::int as total_sessions,
        COUNT(ar.id)::int as total_records,
        COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as present,
        COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::int as absent,
        COUNT(ar.id) FILTER (WHERE ar.status = 'late')::int as late,
        COUNT(ar.id) FILTER (WHERE ar.status = 'excused')::int as excused
      FROM attendance_sessions ats
      LEFT JOIN attendance_records ar ON ats.id = ar.attendance_session_id ${where}
    `) as any[]
    const s = summaryRows[0] || { total_sessions: 0, total_records: 0, present: 0, absent: 0, late: 0, excused: 0 }
    const attendanceRate = s.total_records > 0 ? Math.round((s.present / s.total_records) * 100) : 0

    let bySubject: any[] = []
    try {
      bySubject = await neonSql.query(`
        SELECT ssr.subject_name,
          COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as present,
          COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::int as absent,
          COUNT(ar.id) FILTER (WHERE ar.status = 'late')::int as late
        FROM attendance_records ar
        JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
        LEFT JOIN study_subjects ssr ON ats.study_subject_id = ssr.id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY ssr.subject_name
        ORDER BY ssr.subject_name
      `) as any[]
    } catch { /* ignore */ }

    let byEmployee: any[] = []
    try {
      byEmployee = await neonSql.query(`
        SELECT e.full_name as employee_name,
          COUNT(DISTINCT ats.id)::int as sessions,
          COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as present,
          COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::int as absent
        FROM attendance_sessions ats
        LEFT JOIN employees e ON ats.employee_id = e.id
        LEFT JOIN attendance_records ar ON ats.id = ar.attendance_session_id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY e.full_name
        ORDER BY e.full_name
      `) as any[]
    } catch { /* ignore */ }

    let dailyTrend: any[] = []
    try {
      dailyTrend = await neonSql.query(`
        SELECT ats.session_date as date,
          COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as present,
          COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::int as absent,
          COUNT(ar.id) FILTER (WHERE ar.status = 'late')::int as late
        FROM attendance_sessions ats
        LEFT JOIN attendance_records ar ON ats.id = ar.attendance_session_id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY ats.session_date
        ORDER BY ats.session_date
      `) as any[]
    } catch { /* ignore */ }

    let byMethod: any[] = []
    try {
      byMethod = await neonSql.query(`
        SELECT COALESCE(ar.check_in_method, 'manual') as method, COUNT(ar.id)::int as count
        FROM attendance_records ar
        LEFT JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY ar.check_in_method
      `) as any[]
    } catch { /* ignore */ }

    let topStudents: any[] = []
    let worstStudents: any[] = []
    try {
      topStudents = await neonSql.query(`
        SELECT s.student_number, s.full_name,
          COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as sessions,
          CASE WHEN COUNT(ar.id) > 0 THEN ROUND(COUNT(ar.id) FILTER (WHERE ar.status = 'present')::numeric / COUNT(ar.id) * 100, 1) ELSE 0 END as attendance_rate
        FROM students s
        JOIN attendance_records ar ON s.id = ar.student_id
        LEFT JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY s.id, s.student_number, s.full_name
        HAVING COUNT(ar.id) > 0
        ORDER BY attendance_rate DESC
        LIMIT 10
      `) as any[]
      worstStudents = await neonSql.query(`
        SELECT s.student_number, s.full_name,
          COUNT(ar.id) FILTER (WHERE ar.status = 'present')::int as sessions,
          CASE WHEN COUNT(ar.id) > 0 THEN ROUND(COUNT(ar.id) FILTER (WHERE ar.status = 'present')::numeric / COUNT(ar.id) * 100, 1) ELSE 0 END as attendance_rate
        FROM students s
        JOIN attendance_records ar ON s.id = ar.student_id
        LEFT JOIN attendance_sessions ats ON ar.attendance_session_id = ats.id
        WHERE 1=1 ${where.replace(/ats\./g, 'ats.')}
        GROUP BY s.id, s.student_number, s.full_name
        HAVING COUNT(ar.id) > 0
        ORDER BY attendance_rate ASC
        LIMIT 10
      `) as any[]
    } catch { /* ignore */ }

    return NextResponse.json({
      summary: { ...s, attendance_rate: attendanceRate },
      by_subject: bySubject,
      by_employee: byEmployee,
      daily_trend: dailyTrend,
      by_method: byMethod,
      top_students: topStudents,
      worst_students: worstStudents,
    })
  }

  if (parts[0] === 'attendance-stats' && parts[1]) {
    const studentId = parts[1]
    const rows = await neonSql.query(`
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
    const authUser = (request as any)._authUser
    if (!authUser || authUser.type !== 'student') {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 })
    }
    const studentId = authUser.id

    const student = await neonSql.query(`
      SELECT s.id, s.student_number, s.full_name, s.email, s.phone,
             s.college_id, s.department_id, s.study_level_id, s.study_group_id,
             s.academic_semester_id, s.status, s.photo,
             c.college_name, d.department_name, sl.level_name,
             sg.group_name, sg.group_type, sem.semester_name,
             sem.start_date as semester_start, sem.end_date as semester_end,
             sem.is_current as semester_is_current
      FROM students s
      LEFT JOIN colleges c ON c.id = s.college_id
      LEFT JOIN departments d ON d.id = s.department_id
      LEFT JOIN study_levels sl ON sl.id = s.study_level_id
      LEFT JOIN study_groups sg ON sg.id = s.study_group_id
      LEFT JOIN academic_semesters sem ON sem.id = s.academic_semester_id
      WHERE s.id = ${esc(studentId)} LIMIT 1
    `).then((r: any) => r[0] || null)

    if (!student) {
      return NextResponse.json({ student: null, subjects: [], schedule: [], semester: null, total_hours: 0, total_subjects: 0 })
    }

    const studentSemesterId = student.academic_semester_id

    const schedules = await neonSql.query(`
      SELECT DISTINCT ON (ss.id)
             ss.id, ss.day_of_week, ss.start_time, ss.end_time, ss.room, ss.notes,
             ss.study_subject_id, ss.employee_id, ss.external_employee_id,
             ss.study_group_id, ss.study_level_id, ss.college_id,
             LOWER(ss.day_of_week) as day_key,
             ssr.subject_name, ssr.subject_code, ssr.weekly_hours,
             ssr.department_id as subject_department_id,
             COALESCE(e.full_name, ee.full_name) as employee_name,
             COALESCE(e.email, ee.email) as employee_email,
             COALESCE(e.phone, ee.phone) as employee_phone,
             COALESCE(e.academic_degree, '') as employee_degree,
             sg2.group_name, sg2.group_type,
             c2.college_name, d2.department_name
      FROM study_schedules ss
      LEFT JOIN LATERAL (
        SELECT subject_name, subject_code, weekly_hours, department_id
        FROM study_subjects WHERE id = ss.study_subject_id LIMIT 1
      ) ssr ON true
      LEFT JOIN LATERAL (
        SELECT full_name, email, phone, academic_degree
        FROM employees WHERE id = ss.employee_id LIMIT 1
      ) e ON true
      LEFT JOIN LATERAL (
        SELECT full_name, email, phone
        FROM external_employees WHERE id = ss.external_employee_id LIMIT 1
      ) ee ON true
      LEFT JOIN study_groups sg2 ON sg2.id = ss.study_group_id
      LEFT JOIN colleges c2 ON c2.id = ss.college_id
      LEFT JOIN LATERAL (
        SELECT department_name FROM departments WHERE id = ssr.department_id LIMIT 1
      ) d2 ON true
      WHERE ss.study_group_id = ${esc(student.study_group_id)}
        AND (ss.academic_semester_id = ${esc(studentSemesterId)} OR ss.academic_semester_id IS NULL)
      ORDER BY ss.id, CASE LOWER(ss.day_of_week)
        WHEN 'saturday' THEN 1 WHEN 'sunday' THEN 2 WHEN 'monday' THEN 3
        WHEN 'tuesday' THEN 4 WHEN 'wednesday' THEN 5 WHEN 'thursday' THEN 6
        ELSE 7 END, ss.start_time
    `)

    const subjectIds = [...new Set(schedules.map((s: any) => s.study_subject_id).filter(Boolean))]
    const subjects = subjectIds.length > 0 ? await neonSql.query(`
      SELECT DISTINCT ON (ssr.id)
             ssr.id, ssr.subject_name, ssr.subject_code, ssr.weekly_hours,
             ssr.department_id, ssr.college_id, ssr.study_level_id,
             d.department_name, c.college_name
      FROM study_subjects ssr
      LEFT JOIN departments d ON d.id = ssr.department_id
      LEFT JOIN colleges c ON c.id = ssr.college_id
      WHERE ssr.id IN (${subjectIds.map((id: any) => esc(id)).join(',')})
      ORDER BY ssr.id
    `) : []

    const semester = studentSemesterId ? await neonSql.query(`
      SELECT id, semester_name, start_date, end_date, is_current
      FROM academic_semesters WHERE id = ${esc(studentSemesterId)} LIMIT 1
    `).then((r: any) => r[0] || null) : null

    const totalHours = subjects.reduce((sum: number, s: any) => sum + (parseInt(s.weekly_hours) || 0), 0)

    return NextResponse.json({
      student,
      subjects,
      schedule: schedules,
      semester,
      total_hours: totalHours,
      total_subjects: subjects.length,
    })
  }

  if (fullPath === 'master-timetable' && method === 'GET') {
    const rows = await neonSql.query(`
      SELECT ss.*, ssr.subject_name, e.full_name as employee_name
      FROM study_schedules ss
      LEFT JOIN study_subjects ssr ON ss.study_subject_id = ssr.id
      LEFT JOIN employees e ON ss.employee_id = e.id
      ORDER BY ss.day_of_week, ss.start_time
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'db-schema' && method === 'GET') {
    const rows = await neonSql.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'issue-types' && method === 'GET') {
    const rows = await neonSql.query(`SELECT * FROM default_problems ORDER BY id`)
    return NextResponse.json(rows)
  }

  if (fullPath === 'study-subjects' && method === 'GET') {
    return handleList(neonSql, request, 'study_subjects')
  }

  if (fullPath === 'role-page-permissions' && parts[1] === 'user' && parts[2]) {
    const rows = await neonSql.query(`
      SELECT rpp.*, r.role_name
      FROM role_page_permissions rpp
      JOIN roles r ON rpp.role_id = r.id
      WHERE rpp.role_id IN (SELECT role_id FROM user_permision WHERE user_id = ${esc(parts[2])})
      ORDER BY rpp.page_key
    `)
    return NextResponse.json(rows)
  }

  if (fullPath === 'role-page-permissions' && parts[1] === 'employee' && parts[2]) {
    const rows = await neonSql.query(`
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
      const rows = await neonSql.query(`SELECT * FROM role_page_permissions WHERE role_id = ${esc(roleId)} ORDER BY page_key`)
      return NextResponse.json(rows)
    }
  }

  if (fullPath === 'auth/profile' && method === 'GET') {
    const rows = await neonSql.query(`SELECT id, full_name, email, status FROM users ORDER BY id LIMIT 1`)
    return NextResponse.json(rows[0] || null)
  }

  if (fullPath === 'student-academic-calendar' && method === 'GET') {
    try {
      const studentId = request.nextUrl.searchParams.get('student_id')
      if (!studentId) return NextResponse.json([])
      const rows = await neonSql.query(`
        SELECT ac.* FROM academic_calendar ac
        WHERE ac.academic_semester_id = (SELECT academic_semester_id FROM students WHERE id = ${esc(studentId)})
        ORDER BY ac.event_date ASC
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-library-books' && method === 'GET') {
    try {
      const q = request.nextUrl.searchParams.get('q')
      const searchCondition = q
        ? `AND (b.title ILIKE ${esc('%' + q + '%')} OR b.author ILIKE ${esc('%' + q + '%')} OR b.category ILIKE ${esc('%' + q + '%')})`
        : ''
      const rows = await neonSql.query(`
        SELECT * FROM library_books b WHERE b.status = 'active' ${searchCondition} ORDER BY b.title LIMIT 50
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-library-borrowings' && method === 'GET') {
    try {
      const studentId = request.nextUrl.searchParams.get('student_id')
      if (!studentId) return NextResponse.json([])
      const rows = await neonSql.query(`
        SELECT lb.*, b.title as book_title, b.author as book_author
        FROM library_borrowings lb
        LEFT JOIN library_books b ON b.id = lb.book_id
        WHERE lb.student_id = ${esc(studentId)}
        ORDER BY lb.borrow_date DESC LIMIT 20
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-requests' && method === 'GET') {
    try {
      const studentNumber = request.nextUrl.searchParams.get('student_number')
      if (!studentNumber) return NextResponse.json([])
      const rows = await neonSql.query(`
        SELECT r.*, dp.problem_name as issue_type_name
        FROM requests r
        LEFT JOIN default_problems dp ON dp.id = r.issue_type_id
        WHERE r.user_id_number = ${esc(studentNumber)}
        ORDER BY r.created_at DESC LIMIT 20
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-requests' && method === 'POST') {
    try {
      const body = await request.json()
      const { user_id_number, branch_id, college_id, lab_id, location_name, issue_type_id, study_level_id, department_id, course_name, priority, details } = body
      const rows = await neonSql.query(`
        INSERT INTO requests (user_id_number, branch_id, college_id, lab_id, location_name, issue_type_id, study_level_id, department_id, course_name, priority, details)
        VALUES (${esc(user_id_number)}, ${esc(branch_id)}, ${esc(college_id)}, ${esc(lab_id)}, ${esc(location_name)}, ${esc(issue_type_id)}, ${esc(study_level_id)}, ${esc(department_id)}, ${esc(course_name)}, ${esc(priority)}, ${esc(details)})
        RETURNING *
      `)
      return NextResponse.json(rows[0], { status: 201 })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-announcements' && method === 'GET') {
    try {
      const rows = await neonSql.query(`
        SELECT * FROM university_news
        WHERE (is_published = true OR category = 'announcement')
        ORDER BY created_at DESC LIMIT 20
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-course-assignments' && method === 'GET') {
    try {
      const studentId = request.nextUrl.searchParams.get('student_id')
      if (!studentId) return NextResponse.json([])
      const rows = await neonSql.query(`
        SELECT cs.*, ss.subject_name, ss.subject_code
        FROM course_syllabi cs
        LEFT JOIN study_subjects ss ON ss.id = cs.study_subject_id
        WHERE cs.study_subject_id IN (
          SELECT DISTINCT ss2.study_subject_id
          FROM study_schedules ss2
          WHERE ss2.study_group_id IN (SELECT study_group_id FROM students WHERE id = ${esc(studentId)})
        )
        ORDER BY ss.subject_name
      `)
      return NextResponse.json(rows)
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (fullPath === 'student-notifications-unread' && method === 'GET') {
    const params = request.nextUrl.searchParams
    const studentId = params.get('student_id')
    if (!studentId) return NextResponse.json({ count: 0 })
    try {
      const rows = await neonSql.query(`
        SELECT COUNT(*)::int as count FROM notifications
        WHERE (user_id = ${esc(studentId)}
           OR target_type = 'all'
           OR (target_type = 'student' AND target_id = ${esc(studentId)}))
           AND (is_read = false OR is_read IS NULL)
      `)
      return NextResponse.json({ count: rows[0]?.count || 0 })
    } catch {
      return NextResponse.json({ count: 0 })
    }
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
    neonSql.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status IN ('in_progress','in-progress','processing'))::int AS in_progress, COUNT(*) FILTER (WHERE status IN ('resolved','completed','closed'))::int AS resolved, COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled FROM requests`).then((r: any) => r[0] || { total: 0, pending: 0, in_progress: 0, resolved: 0, cancelled: 0 }),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM users`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM colleges`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM departments`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM labs`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM study_levels`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM study_groups`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM study_subjects`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM academic_semesters`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM guardians`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM exams`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total FROM students`).then((r: any) => r[0]?.total || 0),
    neonSql.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending, COUNT(*) FILTER (WHERE status IN ('in_progress','in-progress','processing'))::int AS in_progress, COUNT(*) FILTER (WHERE status IN ('resolved','completed','done'))::int AS completed FROM tasks`).then((r: any) => r[0] || { total: 0, pending: 0, in_progress: 0, completed: 0 }),
    neonSql.query(`SELECT * FROM requests ORDER BY created_at DESC LIMIT 10`).then((r: any) => r),
  ]).catch(() => [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, []])

  const req = requestsRes || { total: 0, pending: 0, in_progress: 0, resolved: 0, cancelled: 0 }
  const tasks = tasksRes || { total: 0, pending: 0, in_progress: 0, completed: 0 }

  let statusDist: { label: string; count: number; color: string }[] = []
  let priorityDist: { label: string; count: number; color: string }[] = []
  let monthlyTrends: { month: string; count: number }[] = []

  try {
    statusDist = await neonSql.query(`
      SELECT CASE status WHEN 'pending' THEN 'معلق' WHEN 'in_progress' THEN 'قيد التنفيذ' WHEN 'in-progress' THEN 'قيد التنفيذ' WHEN 'processing' THEN 'قيد التنفيذ' WHEN 'resolved' THEN 'تم الحل' WHEN 'completed' THEN 'تم الحل' WHEN 'closed' THEN 'تم الحل' WHEN 'cancelled' THEN 'ملغي' ELSE status END AS label,
        COUNT(*)::int AS count,
        CASE status WHEN 'pending' THEN '#f59e0b' WHEN 'in_progress' THEN '#3b82f6' WHEN 'in-progress' THEN '#3b82f6' WHEN 'processing' THEN '#3b82f6' WHEN 'resolved' THEN '#22c55e' WHEN 'completed' THEN '#22c55e' WHEN 'closed' THEN '#22c55e' WHEN 'cancelled' THEN '#ef4444' ELSE '#6b7280' END AS color
      FROM requests GROUP BY status ORDER BY count DESC
    `) as { label: string; count: number; color: string }[]
  } catch { /* ignore */ }

  try {
    priorityDist = await neonSql.query(`
      SELECT CASE priority WHEN 'high' THEN 'عالية' WHEN 'medium' THEN 'متوسطة' WHEN 'low' THEN 'منخفضة' ELSE priority END AS label,
        COUNT(*)::int AS count,
        CASE priority WHEN 'high' THEN '#ef4444' WHEN 'medium' THEN '#f59e0b' WHEN 'low' THEN '#22c55e' ELSE '#6b7280' END AS color
      FROM requests GROUP BY priority ORDER BY count DESC
    `) as { label: string; count: number; color: string }[]
  } catch { /* ignore */ }

  try {
    monthlyTrends = await neonSql.query(`
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

  const [
    studentRes,
    enrollmentsRes,
    schedulesRes,
    feesRes,
    gpaRes,
    examsRes,
    notificationsRes,
    attendanceRes,
    announcementsRes,
    calendarRes,
  ] = await Promise.all([
    neonSql.query(`
      SELECT s.*, c.college_name, d.department_name, sl.level_name, sg.group_name,
             sem.semester_name, sem.id as semester_id, sem.start_date as semester_start, sem.end_date as semester_end
      FROM students s
      LEFT JOIN colleges c ON c.id = s.college_id
      LEFT JOIN departments d ON d.id = s.department_id
      LEFT JOIN study_levels sl ON sl.id = s.study_level_id
      LEFT JOIN study_groups sg ON sg.id = s.study_group_id
      LEFT JOIN academic_semesters sem ON sem.id = s.academic_semester_id
      WHERE s.id = ${esc(studentId)} LIMIT 1
    `).then((r: any) => r[0] || null),

    neonSql.query(`
      SELECT se.*, sl.level_name, sg.group_name, ssr.subject_name
      FROM student_enrollments se
      LEFT JOIN study_levels sl ON sl.id = se.study_level_id
      LEFT JOIN study_groups sg ON sg.id = se.study_group_id
      LEFT JOIN study_subjects ssr ON ssr.study_level_id = se.study_level_id AND ssr.study_group_id = se.study_group_id
      WHERE se.student_id = ${esc(studentId)}
      ORDER BY se.id DESC LIMIT 10
    `),

    neonSql.query(`
      SELECT ss.*, ssr.subject_name, ssr.subject_code,
             e.full_name as employee_name, sg2.group_name as schedule_group_name
      FROM study_schedules ss
      LEFT JOIN study_subjects ssr ON ss.study_subject_id = ssr.id
      LEFT JOIN employees e ON ss.employee_id = e.id
      LEFT JOIN study_groups sg2 ON sg2.id = ss.study_group_id
      WHERE ss.study_group_id IN (SELECT study_group_id FROM students WHERE id = ${esc(studentId)})
      ORDER BY ss.day_of_week, ss.start_time
    `),

    neonSql.query(`
      SELECT sf.*, ft.fee_name
      FROM student_fees sf
      LEFT JOIN fee_types ft ON ft.id = sf.fee_type_id
      WHERE sf.student_id = ${esc(studentId)}
      ORDER BY sf.id DESC LIMIT 10
    `),

    neonSql.query(`
      SELECT * FROM student_semester_gpa
      WHERE student_id = ${esc(studentId)}
      ORDER BY id DESC LIMIT 5
    `),

    neonSql.query(`
      SELECT es.*, ex.title, ex.total_marks, ex.pass_mark, ex.exam_date, ex.start_time, ex.duration_minutes,
             ssr.subject_name
      FROM exam_schedules es
      LEFT JOIN exams ex ON ex.id = es.exam_id
      LEFT JOIN study_subjects ssr ON ssr.id = ex.subject_id
      WHERE es.study_group_id IN (SELECT study_group_id FROM students WHERE id = ${esc(studentId)})
        AND es.exam_date >= CURRENT_DATE
      ORDER BY es.exam_date, es.start_time
      LIMIT 5
    `),

    neonSql.query(`
      SELECT * FROM notifications
      WHERE user_id = ${esc(studentId)}
         OR target_type = 'all'
         OR (target_type = 'student' AND target_id = ${esc(studentId)})
      ORDER BY created_at DESC LIMIT 10
    `),

    neonSql.query(`
      SELECT ar.*, ssr.subject_name
      FROM attendance_records ar
      LEFT JOIN attendance_sessions asess ON asess.id = ar.attendance_session_id
      LEFT JOIN study_subjects ssr ON ssr.id = asess.study_subject_id
      WHERE ar.student_id = ${esc(studentId)}
      ORDER BY ar.id DESC
    `).then((rows: any[]) => {
      const total = rows.length
      const present = rows.filter((r: any) => r.status === 'present' || r.status === 'attended').length
      const absent = rows.filter((r: any) => r.status === 'absent').length
      const late = rows.filter((r: any) => r.status === 'late').length
      const excused = rows.filter((r: any) => r.status === 'excused').length
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0
      return { total, present, absent, late, excused, percentage, records: rows.slice(0, 5) }
    }),

    neonSql.query(`
      SELECT * FROM university_news
      WHERE status = 'published'
         OR category = 'announcement'
      ORDER BY created_at DESC LIMIT 10
    `),

    neonSql.query(`
      SELECT * FROM academic_calendar
      WHERE academic_semester_id = (SELECT academic_semester_id FROM students WHERE id = ${esc(studentId)})
      ORDER BY event_date ASC
    `),

  ]).catch(() => [null, [], [], [], [], [], [], { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0, records: [] }, [], []])

  const student = studentRes as any
  const semester = student ? { id: student.semester_id, semester_name: student.semester_name, start_date: student.semester_start, end_date: student.semester_end } : null

  const enrollments = (enrollmentsRes as any[]) || []
  const schedules = (schedulesRes as any[]) || []
  const fees = (feesRes as any[]) || []
  const gpa = (gpaRes as any[]) || []
  const upcomingExams = (examsRes as any[]) || []
  const notifications = (notificationsRes as any[]) || []
  const attendance = attendanceRes as any
  const announcements = (announcementsRes as any[]) || []
  const calendar = (calendarRes as any[]) || []

  const totalHours = schedules.reduce((sum: number, s: any) => sum + (parseFloat(s.weekly_hours) || 0), 0)
  const latestGpa = gpa.length > 0 ? gpa[0] : null
  const totalPaid = fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (parseFloat(f.paid_amount) || 0), 0)
  const totalDue = fees.filter((f: any) => f.status !== 'paid').reduce((sum: number, f: any) => sum + (parseFloat(f.remaining_amount) || parseFloat(f.amount) || 0), 0)

  return NextResponse.json({
    student,
    semester,
    statistics: {
      total_subjects: schedules.length,
      total_hours: totalHours,
      cumulative_gpa: student?.cumulative_gpa || null,
      total_earned_hours: student?.total_earned_hours || 0,
      semester_gpa: latestGpa?.semester_gpa || null,
      attendance_percentage: attendance.percentage,
    },
    schedule: schedules,
    courses: enrollments,
    attendance,
    grades: gpa,
    fees: { items: fees, total_paid: totalPaid, total_due: totalDue },
    upcomingExams,
    notifications,
    announcements,
    calendar,
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
