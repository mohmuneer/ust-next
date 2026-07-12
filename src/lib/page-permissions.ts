export interface PagePermission {
  key: string
  label: string
  group: string
}

export const SYSTEM_PAGES: PagePermission[] = [
  // ─── عام ──────────────────────
  { key: 'dashboard', label: 'لوحة التحكم', group: 'عام' },
  { key: 'messages', label: 'الرسائل', group: 'عام' },
  { key: 'chatbot', label: 'المساعد الذكي', group: 'عام' },
  { key: 'reports', label: 'التقارير', group: 'عام' },
  { key: 'contact-messages', label: 'رسائل التواصل', group: 'عام' },

  // ─── الجامعة ──────────────────
  { key: 'university-config', label: 'إعدادات الجامعة', group: 'الجامعة' },
  { key: 'university-events', label: 'أحداث الجامعة', group: 'الجامعة' },
  { key: 'university-news', label: 'أخبار الجامعة', group: 'الجامعة' },

  // ─── هيكلة المشاكل ───────────
  { key: 'branches', label: 'الفروع', group: 'هيكلة المشاكل' },
  { key: 'colleges', label: 'الكليات', group: 'هيكلة المشاكل' },
  { key: 'departments', label: 'الأقسام', group: 'هيكلة المشاكل' },
  { key: 'labs', label: 'المعامل', group: 'هيكلة المشاكل' },
  { key: 'study-levels', label: 'المستويات الدراسية', group: 'هيكلة المشاكل' },
  { key: 'study-groups', label: 'المجموعات الدراسية', group: 'هيكلة المشاكل' },
  { key: 'study-subjects', label: 'المواد الدراسية', group: 'هيكلة المشاكل' },
  { key: 'academic-semesters', label: 'الترمات الدراسية', group: 'هيكلة المشاكل' },
  { key: 'study-schedules', label: 'الجداول الدراسية', group: 'هيكلة المشاكل' },
  { key: 'master-timetable', label: 'الجدول العام', group: 'هيكلة المشاكل' },
  { key: 'study-hours', label: 'سياسة الدوام', group: 'هيكلة المشاكل' },
  { key: 'programs', label: 'البرامج', group: 'هيكلة المشاكل' },
  { key: 'study-plans', label: 'الخطط الدراسية', group: 'هيكلة المشاكل' },
  { key: 'subject-relations', label: 'المتطلبات السابقة', group: 'هيكلة المشاكل' },
  { key: 'buildings', label: 'المباني', group: 'هيكلة المشاكل' },
  { key: 'rooms', label: 'القاعات', group: 'هيكلة المشاكل' },
  { key: 'lectures', label: 'المحاضرات', group: 'هيكلة المشاكل' },
  { key: 'lectures-qr', label: 'QR المحاضرات', group: 'هيكلة المشاكل' },
  { key: 'lectures-attendance', label: 'تحضير يدوي', group: 'هيكلة المشاكل' },
  { key: 'faculty-preferences', label: 'تفضيلات التدريس', group: 'هيكلة المشاكل' },
  { key: 'course-syllabi', label: 'المقررات الدراسية', group: 'هيكلة المشاكل' },
  { key: 'time-slots', label: 'الفترات الزمنية', group: 'هيكلة المشاكل' },

  // ─── المشاكل ─────────────────
  { key: 'problem-groups', label: 'مجموعات المشاكل', group: 'المشاكل' },
  { key: 'default-problems', label: 'المشاكل الافتراضية', group: 'المشاكل' },

  // ─── البلاغات ─────────────────
  { key: 'requests', label: 'البلاغات', group: 'البلاغات' },
  { key: 'requests-reports', label: 'تقارير البلاغات', group: 'البلاغات' },
  { key: 'requests-oversight', label: 'متابعة البلاغات', group: 'البلاغات' },

  // ─── المهام ───────────────────
  { key: 'tasks', label: 'المهام', group: 'المهام' },
  { key: 'tasks-reports', label: 'تقارير المهام', group: 'المهام' },

  // ─── الطلاب ───────────────────
  { key: 'students', label: 'الطلاب', group: 'الطلاب' },
  { key: 'guardians', label: 'أولياء الأمور', group: 'الطلاب' },
  { key: 'student-reports', label: 'تقارير الطلاب', group: 'الطلاب' },
  { key: 'student-enrollments', label: 'التسجيلات الدراسية', group: 'الطلاب' },
  { key: 'student-fees', label: 'رسوم الطلاب', group: 'الطلاب' },
  { key: 'student-semester-gpa', label: 'المعدل الفصلي', group: 'الطلاب' },
  { key: 'academic-records', label: 'السجلات الأكاديمية', group: 'الطلاب' },
  { key: 'academic-warnings', label: 'التنبيهات الأكاديمية', group: 'الطلاب' },
  { key: 'academic-calendar', label: 'التقويم الأكاديمي', group: 'الطلاب' },
  { key: 'scholarships', label: 'المنح الدراسية', group: 'الطلاب' },
  { key: 'attendance-sessions', label: 'جلسات الحضور', group: 'الطلاب' },
  { key: 'attendance-records', label: 'سجلات الحضور', group: 'الطلاب' },
  { key: 'attendance-logs', label: 'سجلات المحاولات', group: 'الطلاب' },
  { key: 'attendance-reports', label: 'تقارير الحضور', group: 'الطلاب' },

  // ─── الامتحانات ───────────────
  { key: 'exams', label: 'الامتحانات', group: 'الامتحانات' },
  { key: 'exam-schedules', label: 'جداول الامتحانات', group: 'الامتحانات' },
  { key: 'exam-grades', label: 'درجات الامتحانات', group: 'الامتحانات' },
  { key: 'exam-seating', label: 'ترتيب مقاعد الامتحانات', group: 'الامتحانات' },

  // ─── المكتبة ──────────────────
  { key: 'library-books', label: 'كتب المكتبة', group: 'المكتبة' },
  { key: 'library-borrowings', label: 'استعارات المكتبة', group: 'المكتبة' },
  { key: 'library-fines', label: 'غرامات المكتبة', group: 'المكتبة' },
  { key: 'library-reservations', label: 'حجوزات المكتبة', group: 'المكتبة' },

  // ─── الرسوم المالية ──────────
  { key: 'fee-types', label: 'أنواع الرسوم', group: 'الرسوم المالية' },
  { key: 'fee-payments', label: 'مدفوعات الرسوم', group: 'الرسوم المالية' },

  // ─── الموظفين ─────────────────
  { key: 'admin-structures', label: 'الهيكل الإداري', group: 'الموظفين' },
  { key: 'job-titles', label: 'المسميات الوظيفية', group: 'الموظفين' },
  { key: 'employees', label: 'الموظفين', group: 'الموظفين' },
  { key: 'employee-certificates', label: 'شهادات الموظفين', group: 'الموظفين' },
  { key: 'employee-assignments', label: 'تكليفات الموظفين', group: 'الموظفين' },
  { key: 'external-employees', label: 'المتعاقدون الخارجيون', group: 'الموظفين' },
  { key: 'job-openings', label: 'الوظائف الشاغرة', group: 'الموظفين' },

  // ─── المستندات ────────────────
  { key: 'documents', label: 'المستندات', group: 'المستندات' },
  { key: 'document-categories', label: 'تصنيفات المستندات', group: 'المستندات' },
  { key: 'contractor-documents', label: 'مستندات المقاولين', group: 'المستندات' },

  // ─── المقاولون ────────────────
  { key: 'contractors', label: 'المقاولون', group: 'المقاولون' },

  // ─── المستخدمين ───────────────
  { key: 'users', label: 'المستخدمين', group: 'المستخدمين' },
  { key: 'users-reports', label: 'تقارير المستخدمين', group: 'المستخدمين' },
  { key: 'users-profile', label: 'الملف الشخصي', group: 'المستخدمين' },

  // ─── الصلاحيات ───────────────
  { key: 'roles', label: 'الأدوار', group: 'الصلاحيات' },
  { key: 'permissions', label: 'الصلاحيات', group: 'الصلاحيات' },
  { key: 'permissions-users', label: 'صلاحيات المستخدمين', group: 'الصلاحيات' },
  { key: 'assign-permissions', label: 'توزيع الصلاحيات', group: 'الصلاحيات' },

  // ─── الإشعارات ───────────────
  { key: 'notifications', label: 'الإشعارات', group: 'الإشعارات' },
  { key: 'notification-templates', label: 'قوالب الإشعارات', group: 'الإشعارات' },

  // ─── تهيئة النظام ────────────
  { key: 'system-settings', label: 'إعدادات النظام', group: 'تهيئة النظام' },
  { key: 'system-visuals', label: 'السمات', group: 'تهيئة النظام' },
  { key: 'system-logs', label: 'سجل النظام', group: 'تهيئة النظام' },
  { key: 'backup', label: 'النسخ الاحتياطي', group: 'تهيئة النظام' },
  { key: 'db-schema', label: 'هيكل قاعدة البيانات', group: 'تهيئة النظام' },
  { key: 'settings', label: 'الإعدادات', group: 'تهيئة النظام' },
  { key: 'logs', label: 'السجلات', group: 'تهيئة النظام' },
  { key: 'setup-workflow', label: 'سير عمل الإعداد', group: 'تهيئة النظام' },
]

export type PagePermissionsMap = Record<string, {
  can_view: boolean
  can_add: boolean
  can_edit: boolean
  can_delete: boolean
}>

const PATH_TO_PAGE_KEY: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/messages': 'messages',
  '/chatbot': 'chatbot',
  '/reports': 'reports',
  '/contact-messages': 'contact-messages',
  '/university-config': 'university-config',
  '/university-events': 'university-events',
  '/university-news': 'university-news',
  '/branches': 'branches',
  '/colleges': 'colleges',
  '/departments': 'departments',
  '/labs': 'labs',
  '/study-levels': 'study-levels',
  '/study-groups': 'study-groups',
  '/study-subjects': 'study-subjects',
  '/academic-semesters': 'academic-semesters',
  '/study-schedules': 'study-schedules',
  '/master-timetable': 'master-timetable',
  '/study-hours': 'study-hours',
  '/programs': 'programs',
  '/study-plans': 'study-plans',
  '/subject-relations': 'subject-relations',
  '/buildings': 'buildings',
  '/rooms': 'rooms',
  '/lectures/qr': 'lectures-qr',
  '/lectures': 'lectures',
  '/faculty-preferences': 'faculty-preferences',
  '/course-syllabi': 'course-syllabi',
  '/time-slots': 'time-slots',
  '/problem-groups': 'problem-groups',
  '/default-problems': 'default-problems',
  '/requests/oversight': 'requests-oversight',
  '/requests/reports': 'requests-reports',
  '/requests': 'requests',
  '/tasks/reports': 'tasks-reports',
  '/tasks/new': 'tasks',
  '/tasks': 'tasks',
  '/students/reports': 'student-reports',
  '/students': 'students',
  '/guardians': 'guardians',
  '/student-enrollments': 'student-enrollments',
  '/student-fees': 'student-fees',
  '/student-semester-gpa': 'student-semester-gpa',
  '/academic-records': 'academic-records',
  '/academic-warnings': 'academic-warnings',
  '/academic-calendar': 'academic-calendar',
  '/scholarships': 'scholarships',
  '/attendance-sessions': 'attendance-sessions',
  '/attendance-records': 'attendance-records',
  '/attendance-logs': 'attendance-logs',
  '/attendance/reports': 'attendance-reports',
  '/lectures/attendance': 'lectures-attendance',
  '/exams': 'exams',
  '/exam-schedules': 'exam-schedules',
  '/exam-grades': 'exam-grades',
  '/exam-seating': 'exam-seating',
  '/library-books': 'library-books',
  '/library-borrowings': 'library-borrowings',
  '/library-fines': 'library-fines',
  '/library-reservations': 'library-reservations',
  '/fee-types': 'fee-types',
  '/fee-payments': 'fee-payments',
  '/admin-structures': 'admin-structures',
  '/job-titles': 'job-titles',
  '/employees': 'employees',
  '/external-employees': 'external-employees',
  '/job-openings': 'job-openings',
  '/documents': 'documents',
  '/document-categories': 'document-categories',
  '/contractor-documents': 'contractor-documents',
  '/contractors': 'contractors',
  '/users/profile': 'users-profile',
  '/users/reports': 'users-reports',
  '/users/new': 'users',
  '/users': 'users',
  '/roles/assign': 'assign-permissions',
  '/roles/new': 'roles',
  '/roles': 'roles',
  '/permissions/users': 'permissions-users',
  '/permissions': 'permissions',
  '/notifications': 'notifications',
  '/notification-templates': 'notification-templates',
  '/system/visuals': 'system-visuals',
  '/system/logs': 'system-logs',
  '/system/backup': 'backup',
  '/system/db-schema': 'db-schema',
  '/system/settings': 'system-settings',
  '/settings': 'settings',
  '/logs': 'logs',
  '/setup-workflow': 'setup-workflow',
}

export function getPageKeyFromPath(pathname: string): string | null {
  const path = pathname.replace(/^\/(dashboard)/, '') || '/dashboard'
  const normalized = path.startsWith('/') ? path : `/${path}`

  if (PATH_TO_PAGE_KEY[normalized]) return PATH_TO_PAGE_KEY[normalized]

  const segments = normalized.split('/').filter(Boolean)
  for (let i = segments.length; i >= 1; i--) {
    const candidate = '/' + segments.slice(0, i).join('/')
    if (PATH_TO_PAGE_KEY[candidate]) return PATH_TO_PAGE_KEY[candidate]
  }

  return null
}
