-- =====================================================
-- Migration: New Modules for Smart University ERP
-- Database: PostgreSQL (also compatible with MySQL)
-- =====================================================

-- 1. Course Syllabi (توصيف المواد)
CREATE TABLE IF NOT EXISTS course_syllabi (
  id SERIAL PRIMARY KEY,
  study_subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  objectives TEXT,
  learning_outcomes TEXT,
  teaching_methods TEXT,
  assessment_methods TEXT,
  "references" TEXT,
  weekly_plan JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Fees (الرسوم المالية)
CREATE TABLE IF NOT EXISTS fee_types (
  id SERIAL PRIMARY KEY,
  fee_name VARCHAR(255) NOT NULL,
  fee_name_en VARCHAR(255),
  fee_code VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period VARCHAR(50), -- yearly, semesterly, monthly, one-time
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_fees (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type_id INTEGER NOT NULL REFERENCES fee_types(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  discount_reason VARCHAR(255),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, partial, paid, cancelled, waived
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id SERIAL PRIMARY KEY,
  student_fee_id INTEGER NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(100), -- cash, bank_transfer, card, online, cheque
  transaction_id VARCHAR(255),
  receipt_number VARCHAR(100),
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scholarships (
  id SERIAL PRIMARY KEY,
  scholarship_name VARCHAR(255) NOT NULL,
  scholarship_type VARCHAR(100), -- full, partial, merit, need_based
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  max_students INTEGER,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_scholarships (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',
  granted_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Attendance (الحضور والانصراف)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  study_schedule_id INTEGER REFERENCES study_schedules(id) ON DELETE SET NULL,
  study_subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  external_employee_id INTEGER REFERENCES external_employees(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  session_type VARCHAR(50) DEFAULT 'lecture', -- lecture, lab, tutorial, exam
  qr_code VARCHAR(255),
  qr_expires_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  attendance_session_id INTEGER NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'absent', -- present, absent, late, excused
  check_in_time TIMESTAMP,
  check_in_method VARCHAR(50), -- qr, nfc, rfid, face, fingerprint, manual
  late_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(attendance_session_id, student_id)
);

-- 4. Library (المكتبة)
CREATE TABLE IF NOT EXISTS library_books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  author VARCHAR(255),
  publisher VARCHAR(255),
  isbn VARCHAR(100),
  edition VARCHAR(50),
  publication_year INTEGER,
  category VARCHAR(255),
  book_type VARCHAR(100), -- printed, electronic, audio
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  shelf_location VARCHAR(100),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  cover_image VARCHAR(255),
  file_path VARCHAR(255), -- for e-books
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_borrowings (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  borrowed_by_type VARCHAR(50) NOT NULL, -- student, employee, external
  borrowed_by_name VARCHAR(255),
  borrowed_by_id_number VARCHAR(100),
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  renew_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'borrowed', -- borrowed, returned, overdue, lost
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_fines (
  id SERIAL PRIMARY KEY,
  borrowing_id INTEGER NOT NULL REFERENCES library_borrowings(id) ON DELETE CASCADE,
  fine_type VARCHAR(100) DEFAULT 'overdue',
  amount DECIMAL(10,2) NOT NULL,
  days_overdue INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_reservations (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  reserved_by_type VARCHAR(50) NOT NULL,
  reserved_by_name VARCHAR(255),
  reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, fulfilled, cancelled, expired
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Documents & Archives (الوثائق والأرشفة)
CREATE TABLE IF NOT EXISTS document_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES document_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES document_categories(id) ON DELETE SET NULL,
  document_type VARCHAR(100), -- pdf, word, excel, image, other
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  entity_type VARCHAR(100), -- student, employee, contractor, general
  entity_id INTEGER,
  tags TEXT,
  is_archived BOOLEAN DEFAULT false,
  is_confidential BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Notifications (الإشعارات)
CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  template_key VARCHAR(100) UNIQUE,
  subject VARCHAR(500),
  body TEXT NOT NULL,
  channels VARCHAR(255) DEFAULT 'email', -- email,sms,whatsapp,push,telegram
  variables TEXT, -- JSON array of variable names
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_type VARCHAR(50) NOT NULL, -- user, student, employee, guardian, all
  recipient_id INTEGER,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL, -- email, sms, whatsapp, push, telegram
  template_id INTEGER REFERENCES notification_templates(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, delivered, read
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  response TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Academic Records (السجل الأكاديمي)
CREATE TABLE IF NOT EXISTS academic_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  study_subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  grade_numeric DECIMAL(5,2),
  grade_letter VARCHAR(10),
  grade_points DECIMAL(5,2),
  is_pass BOOLEAN,
  status VARCHAR(50) DEFAULT 'enrolled', -- enrolled, in_progress, completed, failed, withdrawn, incomplete
  attendance_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, study_subject_id, academic_semester_id)
);

CREATE TABLE IF NOT EXISTS academic_warnings (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  warning_type VARCHAR(100) NOT NULL, -- low_gpa, attendance, academic_probation, behavior
  warning_level INTEGER DEFAULT 1, -- 1, 2, 3 (final)
  reason TEXT,
  gpa_at_warning DECIMAL(5,2),
  semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  issued_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, resolved, expired
  resolved_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Student Enrollments (التسجيل الأكاديمي)
CREATE TABLE IF NOT EXISTS student_enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_semester_id INTEGER NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
  enrollment_type VARCHAR(50) DEFAULT 'new', -- new, regular, readmission, transfer, exchange
  enrollment_date DATE DEFAULT CURRENT_DATE,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  total_hours INTEGER DEFAULT 0,
  max_hours INTEGER,
  status VARCHAR(50) DEFAULT 'active', -- active, withdrawn, deferred, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, academic_semester_id)
);

-- 9. Exam Management Extended (الامتحانات المتكاملة)
CREATE TABLE IF NOT EXISTS exam_schedules (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  exam_date DATE,
  start_time TIME,
  end_time TIME,
  student_count INTEGER DEFAULT 0,
  proctor_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  proctor2_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_seating (
  id SERIAL PRIMARY KEY,
  exam_schedule_id INTEGER NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  seat_number VARCHAR(20),
  row_number INTEGER,
  column_number INTEGER,
  attendance_status VARCHAR(50) DEFAULT 'absent', -- present, absent, late
  check_in_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_schedule_id, student_id)
);

CREATE TABLE IF NOT EXISTS exam_grades (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL(10,2),
  percentage DECIMAL(5,2),
  grade_letter VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending', -- pending, submitted, graded, published
  graded_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  graded_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, student_id)
);

-- 10. Contractors Management (إدارة المتعاقدين)
CREATE TABLE IF NOT EXISTS contractors (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(255),
  identity_number VARCHAR(100),
  phone VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  contract_type VARCHAR(100), -- full_time, part_time, consultancy, project_based
  contract_number VARCHAR(100),
  start_date DATE,
  end_date DATE,
  contract_duration_months INTEGER,
  salary_amount DECIMAL(12,2),
  allowances DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  payment_frequency VARCHAR(50), -- monthly, quarterly, yearly, lump_sum
  bank_account VARCHAR(100),
  bank_name VARCHAR(255),
  tax_number VARCHAR(100),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  supervisor_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, expired, terminated, renewed
  notes TEXT,
  notify_before_expiry INTEGER DEFAULT 30, -- days
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contractor_documents (
  id SERIAL PRIMARY KEY,
  contractor_id INTEGER NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- contract, passport, id, certificate, etc.
  document_name VARCHAR(255),
  file_path VARCHAR(500),
  issue_date DATE,
  expiry_date DATE,
  notify_before_expiry INTEGER DEFAULT 30,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Student Academic Accounts (الملف الأكاديمي للطالب)
ALTER TABLE students ADD COLUMN IF NOT EXISTS total_earned_hours INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS total_gpa_points DECIMAL(10,2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS cumulative_gpa DECIMAL(5,3) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE students ADD COLUMN IF NOT EXISTS enrollment_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS expected_graduation_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- 12. Time slots for scheduling (الفترات الزمنية للجدول)
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  slot_name VARCHAR(100),
  day_of_week INTEGER NOT NULL, -- 0=Sunday..6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type VARCHAR(50) DEFAULT 'regular', -- regular, break, prayer
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(day_of_week, start_time, end_time, college_id)
);

-- 13. Academic Calendar (التقويم الأكاديمي)
CREATE TABLE IF NOT EXISTS academic_calendar (
  id SERIAL PRIMARY KEY,
  academic_semester_id INTEGER NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- registration_start, registration_end, classes_start, classes_end, exams_start, exams_end, holiday, event
  event_title VARCHAR(500) NOT NULL,
  event_title_en VARCHAR(500),
  description TEXT,
  is_holiday BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. University data configuration (بيانات الجامعة)
CREATE TABLE IF NOT EXISTS university_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_group VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO university_config (config_key, config_value, config_group, description) VALUES
('university_name', 'جامعة العلوم والتكنولوجيا', 'general', 'اسم الجامعة'),
('university_name_en', 'University of Science and Technology', 'general', 'اسم الجامعة بالإنجليزية'),
('university_logo', '', 'general', 'شعار الجامعة'),
('university_email', 'info@ust.edu.ye', 'contact', 'البريد الإلكتروني للجامعة'),
('university_phone', '+967123456789', 'contact', 'هاتف الجامعة'),
('university_address', 'صنعاء - اليمن', 'contact', 'عنوان الجامعة'),
('grading_system', 'letter', 'academic', 'نظام الدرجات'),
('credit_hours_system', 'semester', 'academic', 'نظام الساعات'),
('academic_year_start', '2026-09-01', 'academic', 'بداية العام الأكاديمي'),
('academic_year_end', '2027-08-31', 'academic', 'نهاية العام الأكاديمي'),
('attendance_method', 'qr', 'attendance', 'طريقة تسجيل الحضور'),
('exam_pass_percentage', '50', 'academic', 'نسبة النجاح في الامتحانات')
ON CONFLICT (config_key) DO NOTHING;

-- 15. Company/Branch info for the public portal
CREATE TABLE IF NOT EXISTS university_news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  slug VARCHAR(500) UNIQUE,
  summary TEXT,
  content TEXT,
  image VARCHAR(500),
  category VARCHAR(100), -- news, event, announcement, achievement
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS university_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  slug VARCHAR(500) UNIQUE,
  description TEXT,
  event_date DATE,
  event_time TIME,
  location VARCHAR(500),
  image VARCHAR(500),
  category VARCHAR(100), -- conference, workshop, seminar, cultural, sport
  is_published BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_openings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  department VARCHAR(255),
  job_type VARCHAR(100), -- full_time, part_time, contract
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(255),
  application_deadline DATE,
  is_published BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15b. Guardian-Student junction table (many-to-many)
CREATE TABLE IF NOT EXISTS guardian_students (
  id SERIAL PRIMARY KEY,
  guardian_id INTEGER NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(guardian_id, student_id)
);

-- Migrate existing single student_id to junction table
INSERT INTO guardian_students (guardian_id, student_id)
SELECT id, student_id FROM guardians WHERE student_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Remove student_id column from guardians (now uses junction table)
ALTER TABLE guardians DROP COLUMN IF EXISTS student_id;

-- 16. Student GPA Calculation Log
CREATE TABLE IF NOT EXISTS student_semester_gpa (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_semester_id INTEGER NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
  semester_hours INTEGER DEFAULT 0,
  semester_gpa DECIMAL(5,3) DEFAULT 0,
  semester_points DECIMAL(10,2) DEFAULT 0,
  cumulative_hours INTEGER DEFAULT 0,
  cumulative_gpa DECIMAL(5,3) DEFAULT 0,
  cumulative_points DECIMAL(10,2) DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, academic_semester_id)
);

-- 17. Exam Sessions (جلسات الاختبارات)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','terminated','expired')),
  ip_address VARCHAR(45),
  device_id VARCHAR(255),
  browser_fingerprint TEXT,
  os_info VARCHAR(255),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  focus_lost_count INTEGER DEFAULT 0,
  page_exit_attempts INTEGER DEFAULT 0,
  total_focus_lost_seconds INTEGER DEFAULT 0,
  connection_drops INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, student_id, session_token)
);

-- 18. Exam Answers (إجابات الاختبارات)
CREATE TABLE IF NOT EXISTS exam_answers (
  id SERIAL PRIMARY KEY,
  exam_session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_file VARCHAR(255),
  is_correct BOOLEAN,
  score DECIMAL(5,2),
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_session_id, question_id)
);

-- 19. Exam Security Logs (سجل الأمان)
CREATE TABLE IF NOT EXISTS exam_security_logs (
  id SERIAL PRIMARY KEY,
  exam_session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Add duration_minutes and shuffle_questions to exams if not exist
ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT true;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS shuffle_choices BOOLEAN DEFAULT true;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS max_focus_lost INTEGER DEFAULT 5;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT false;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS show_result_immediately BOOLEAN DEFAULT false;

-- Add password column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;

-- Add file_path column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) DEFAULT NULL;

-- Add password column to external_employees table
ALTER TABLE external_employees ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;

-- Add file_path column to external_employees table
ALTER TABLE external_employees ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) DEFAULT NULL;

-- Create employee_permissions table (junction: employees <-> roles)
CREATE TABLE IF NOT EXISTS employee_permissions (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, role_id)
);
