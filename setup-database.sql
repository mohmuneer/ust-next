-- =====================================================
-- UST Database Setup Script for PostgreSQL (Neon)
-- Run this ONCE to initialize the database
-- =====================================================

-- =====================================================
-- BASE TABLES (required before seed data)
-- =====================================================

CREATE TABLE IF NOT EXISTS branch (
  id SERIAL PRIMARY KEY,
  branch_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS colleges (
  id SERIAL PRIMARY KEY,
  college_name VARCHAR(255) NOT NULL,
  branch_id INTEGER REFERENCES branch(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  lab_name VARCHAR(255) NOT NULL,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS study_levels (
  id SERIAL PRIMARY KEY,
  level_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS study_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  group_type VARCHAR(50),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS academic_semesters (
  id SERIAL PRIMARY KEY,
  semester_name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  program_name VARCHAR(255) NOT NULL,
  program_name_en VARCHAR(255),
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  total_hours INTEGER DEFAULT 0,
  total_levels INTEGER DEFAULT 4,
  status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS study_plans (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS study_subjects (
  id SERIAL PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  weekly_hours INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subject_relations (
  id SERIAL PRIMARY KEY,
  study_subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  related_subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  relation_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS plan_subjects (
  id SERIAL PRIMARY KEY,
  study_plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  study_subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  is_required BOOLEAN DEFAULT true,
  theory_hours INTEGER DEFAULT 0,
  practical_hours INTEGER DEFAULT 0,
  lab_hours INTEGER DEFAULT 0,
  project_hours INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  building_name VARCHAR(255) NOT NULL,
  building_code VARCHAR(20),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL,
  room_code VARCHAR(50),
  building_id INTEGER REFERENCES buildings(id) ON DELETE SET NULL,
  room_type VARCHAR(50),
  capacity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS default_problems (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  problem_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL,
  role_code VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS job_titles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES admin_structures(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  status INTEGER DEFAULT 1,
  view_personal_tasks INTEGER DEFAULT 0,
  view_group_tasks INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_permision (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  system_name VARCHAR(255),
  admin_email VARCHAR(255),
  contact_number VARCHAR(50),
  address TEXT,
  system_logo VARCHAR(500),
  maintenance_mode INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS system_visuals (
  id SERIAL PRIMARY KEY,
  system_font VARCHAR(100),
  sidebar_color VARCHAR(50),
  header_color VARCHAR(50),
  main_color VARCHAR(50),
  add_btn_color VARCHAR(50),
  print_btn_color VARCHAR(50),
  delete_btn_color VARCHAR(50),
  card_color VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  admin_structure_id INTEGER REFERENCES admin_structures(id) ON DELETE SET NULL,
  job_title_id INTEGER REFERENCES job_titles(id) ON DELETE SET NULL,
  academic_degree VARCHAR(100),
  specialization VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  password VARCHAR(255) DEFAULT NULL,
  file_path VARCHAR(500) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS employee_certificates (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  certificate_name VARCHAR(255) NOT NULL,
  issuing_authority VARCHAR(255),
  year VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS employee_assignments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branch(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  study_subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS external_employees (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  password VARCHAR(255) DEFAULT NULL,
  contract_type VARCHAR(50),
  branch_id INTEGER REFERENCES branch(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  study_subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  hours_count INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  work_time VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  file_path VARCHAR(500) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',
  total_earned_hours INTEGER DEFAULT 0,
  total_gpa_points DECIMAL(10,2) DEFAULT 0,
  cumulative_gpa DECIMAL(5,3) DEFAULT 0,
  academic_status VARCHAR(50) DEFAULT 'active',
  enrollment_date DATE,
  expected_graduation_date DATE,
  nationality VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(10),
  address TEXT,
  photo VARCHAR(500),
  password VARCHAR(255),
  password_changed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guardians (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  relation_type VARCHAR(50),
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS guardian_students (
  id SERIAL PRIMARY KEY,
  guardian_id INTEGER NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(guardian_id, student_id)
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  total_marks INTEGER DEFAULT 100,
  pass_mark INTEGER DEFAULT 50,
  exam_date DATE,
  start_time TIME,
  status VARCHAR(50) DEFAULT 'draft',
  duration_minutes INTEGER DEFAULT 60,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_choices BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 1,
  max_focus_lost INTEGER DEFAULT 5,
  instructions TEXT,
  allow_review BOOLEAN DEFAULT false,
  show_result_immediately BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT,
  marks INTEGER DEFAULT 5,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  user_id_number VARCHAR(50),
  branch_id INTEGER REFERENCES branch(id) ON DELETE SET NULL,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  lab_id INTEGER REFERENCES labs(id) ON DELETE SET NULL,
  location_name VARCHAR(255),
  issue_type_id INTEGER REFERENCES default_problems(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  course_name VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'Normal',
  details TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT,
  priority VARCHAR(50) DEFAULT 'Normal',
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sidebar_menu (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  link VARCHAR(255),
  parent_id INTEGER DEFAULT 0,
  permission_key VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  receiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message_text TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  perm_key VARCHAR(100) UNIQUE NOT NULL,
  perm_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_page_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  page_key VARCHAR(100) NOT NULL,
  can_view VARCHAR(5) DEFAULT 'f',
  can_add VARCHAR(5) DEFAULT 'f',
  can_edit VARCHAR(5) DEFAULT 'f',
  can_delete VARCHAR(5) DEFAULT 'f'
);

CREATE TABLE IF NOT EXISTS user_page_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES sidebar_menu(id) ON DELETE CASCADE,
  can_view INTEGER DEFAULT 0,
  can_add INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  can_transfer INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_group_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_branches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id INTEGER NOT NULL REFERENCES branch(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS chatbot_training (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  intent VARCHAR(100),
  sql_query TEXT,
  expected_response TEXT
);

CREATE TABLE IF NOT EXISTS question_templates (
  id SERIAL PRIMARY KEY,
  template_text VARCHAR(500) NOT NULL,
  intent VARCHAR(100),
  category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS training_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  intent VARCHAR(100),
  category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255),
  action VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty_preferences (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  max_hours_per_week INTEGER DEFAULT 20,
  max_hours_per_day INTEGER DEFAULT 6,
  preferred_start_time TIME,
  preferred_end_time TIME,
  available_days TEXT,
  preferred_building_id INTEGER REFERENCES buildings(id) ON DELETE SET NULL,
  break_day VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS study_schedules (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  day_of_week VARCHAR(20),
  start_time TIME,
  end_time TIME,
  study_subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  external_employee_id INTEGER REFERENCES external_employees(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  room VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS lectures (
  id SERIAL PRIMARY KEY,
  study_schedule_id INTEGER REFERENCES study_schedules(id) ON DELETE SET NULL,
  study_subject_id INTEGER REFERENCES study_subjects(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  day_of_week VARCHAR(20),
  start_time TIME,
  end_time TIME,
  lecture_type VARCHAR(50) DEFAULT 'theory',
  status VARCHAR(50) DEFAULT 'scheduled'
);
