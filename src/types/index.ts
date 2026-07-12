// ===================== User & Auth =====================
export interface User {
  id: number
  full_name: string
  email: string
  password?: string
  file_path: string | null
  status: number
  created_at?: string
  updated_at?: string
  branch_name?: string
  role_name?: string
  role_code?: string
  view_personal_tasks?: number
  view_group_tasks?: number
}

export interface Role {
  id: number
  role_name: string
  role_code: string
}

export interface UserPermission {
  user_id: number
  role_id: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface EmployeeLoginRequest {
  employee_code: string
  password: string
}

export interface EmployeeAuthResponse {
  employee: Employee
  token: string
}

// ===================== Branch & Location =====================
export interface Branch {
  id: number
  branch_name: string
  created_at?: string
}

export interface College {
  id: number
  college_name: string
  branch_id: number
  branch_name?: string
  created_at?: string
}

export interface Department {
  id: number
  department_name: string
  college_id: number
  college_name?: string
  created_at?: string
}

export interface Lab {
  id: number
  lab_name: string
  college_id: number
  college_name?: string
  created_at?: string
}

export interface StudyLevel {
  id: number
  level_name: string
  created_at?: string
}

// ===================== Problem Types =====================
export interface ProblemGroup {
  id: number
  group_name: string
  created_at?: string
}

export interface DefaultProblem {
  id: number
  problem_name: string
  group_id: number
  group_name?: string
  created_at?: string
}

export interface StudyGroup {
  id: number
  group_name: string
  group_type: 'نظري' | 'عملي'
  college_id: number | null
  college_name?: string
  created_at?: string
}

export interface StudySubject {
  id: number
  subject_name: string
  subject_code: string | null
  college_id: number | null
  department_id: number | null
  study_level_id: number | null
  study_group_id: number | null
  academic_semester_id: number | null
  weekly_hours: number | null
  college_name?: string
  department_name?: string
  level_name?: string
  group_name?: string
  semester_name?: string
  created_at?: string
}

export interface AcademicSemester {
  id: number
  semester_name: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  created_at?: string
}

export interface Student {
  id: number
  student_number: string
  full_name: string
  email: string | null
  phone: string | null
  college_id: number | null
  department_id: number | null
  study_level_id: number | null
  study_group_id: number | null
  academic_semester_id: number | null
  status: string
  photo: string | null
  college_name?: string
  department_name?: string
  level_name?: string
  group_name?: string
  semester_name?: string
  created_at?: string
}

export interface Guardian {
  id: number
  full_name: string
  phone: string | null
  email: string | null
  address: string | null
  relation_type: string
  students?: GuardianStudent[]
  created_at?: string
}

export interface GuardianStudent {
  id: number
  student_name: string
  student_number: string
}

export interface Exam {
  id: number
  title: string
  subject_id: number | null
  duration_minutes: number
  total_marks: number
  pass_mark: number
  exam_date: string | null
  start_time: string | null
  status: string
  subject_name?: string
  subject_code?: string
  created_at?: string
}

export interface ExamQuestion {
  id: number
  exam_id: number
  question_text: string
  question_type: string
  options: string[] | null
  correct_answer: string | null
  marks: number
  sort_order: number
  created_at?: string
}

export interface SystemSetting {
  id: number
  system_name: string
  admin_email: string
  contact_number: string
  address: string
  system_logo: string
  maintenance_mode: number
  created_at?: string
  updated_at?: string
}

// ===================== Requests & Tasks =====================
export type Priority = 'Low' | 'Medium' | 'High'
export type RequestStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled'
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'

export interface Request {
  id: number
  user_id_number: number
  branch_id: number
  college_id: number
  lab_id: number | null
  location_name: string
  issue_type_id: number
  study_level_id: number | null
  department_id: number | null
  course_name: string
  priority: Priority
  details: string
  problem_image: string | null
  status: RequestStatus
  created_at: string
  updated_at?: string
  // Joined fields
  branch_name?: string
  college_name?: string
  lab_name?: string
  group_name?: string
  level_name?: string
  department_name?: string
  user_name?: string
  task_id?: number
  task_status?: TaskStatus
  technician_name?: string
  rating?: number
  rating_comment?: string | null
  deadline?: string
}

export interface CreateRequestPayload {
  branch_id: number
  college_id: number
  lab_id?: number | null
  location_name?: string
  priority: Priority
  details: string
  issue_type_id: number
  study_level_id?: number | null
  department_id?: number | null
  course_name?: string
  problem_image?: File | null
}

export interface Task {
  id: number
  request_id: number
  assigned_to: number
  created_by?: number
  title?: string
  priority: Priority
  status: TaskStatus
  details: string | null
  deadline: string | null
  rating: number | null
  rating_comment: string | null
  created_at: string
  updated_at?: string
  // Joined fields
  technician_name?: string
  requester_name?: string
  creator_name?: string
  branch_name?: string
  college_name?: string
  group_name?: string
  level_name?: string
  location_name?: string
  course_name?: string
  req_details?: string
  request_details?: string
  request_priority?: string
  request_status?: RequestStatus
  request_date?: string
  problem_image?: string
  problem_image_url?: string
}

export interface CompleteTaskPayload {
  task_id: number
  completion_notes?: string
}

export interface TransferTaskPayload {
  task_id: number
  new_technician_id: number
  transfer_note?: string
}

export interface RatingPayload {
  task_id: number
  rating: number
  rating_comment?: string
}

// ===================== Messages =====================
export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message_text: string
  is_read: number
  created_at: string
  full_name?: string
  file_path?: string | null
}

// ===================== Permissions =====================
export interface PageAccess {
  id: number
  user_id: number
  menu_id: number
  can_view: number
  can_add: number
  can_edit: number
  can_delete: number
  can_transfer: number
}

export interface GroupAccess {
  id: number
  user_id: number
  group_id: number
}

// ===================== Sidebar Menu =====================
export interface SidebarMenuItem {
  id: number
  parent_id: number
  title: string
  icon: string
  link: string
  sort_order: number
  children?: SidebarMenuItem[]
}

// ===================== System =====================
export interface SystemSettings {
  id: number
  system_name: string
  system_logo: string
  system_email: string
}

export interface SystemVisuals {
  id: number
  system_font: string
  header_color: string
  sidebar_color: string
  main_color: string
  add_btn_color: string
  print_btn_color: string
  delete_btn_color: string
  card_color: string
}

export interface SystemLog {
  id: number
  user_id: number | null
  user_name?: string
  action: string
  action_type?: string
  entity?: string | null
  entity_id?: number | null
  details?: string | null
  description?: string
  ip_address?: string | null
  created_at: string
}

// ===================== Dashboard =====================
export interface DashboardStats {
  total_requests: number
  pending_requests: number
  in_progress_requests: number
  resolved_requests: number
  cancelled_requests: number
  total_users: number
  active_users: number
  total_branches: number
  total_colleges: number
  total_labs: number
  total_departments: number
  total_students: number
  total_guardians: number
  total_exams: number
  total_subjects: number
  total_levels: number
  total_groups: number
  total_semesters: number
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  processing_tasks?: number
  completion_rate: number
  priority_distribution: { label: string; count: number; color: string }[]
  status_distribution: { label: string; count: number; color: string }[]
  monthly_trends: { month: string; count: number }[]
  branch_user_distribution: { label: string; count: number }[]
  recent_requests: Request[]
}

// ===================== Employees =====================
export interface AdminStructure {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  created_at?: string
}

export interface JobTitle {
  id: number
  title: string
  created_at?: string
}

export interface Employee {
  id: number
  employee_code: string
  full_name: string
  email: string | null
  phone: string | null
  password?: string | null
  admin_structure_id: number | null
  job_title_id: number | null
  academic_degree: string | null
  specialization: string | null
  status: string
  file_path: string | null
  created_at?: string
  admin_structure_name?: string
  job_title_name?: string
}

export interface EmployeeCertificate {
  id: number
  employee_id: number
  certificate_name: string
  issuing_authority: string | null
  year: string | null
  file_path: string | null
  created_at?: string
}

export interface ExternalEmployee {
  id: number
  full_name: string
  email: string | null
  phone: string | null
  password?: string | null
  contract_type: string
  branch_id: number | null
  department_id: number | null
  study_subject_id: number | null
  study_group_id: number | null
  study_level_id: number | null
  academic_semester_id: number | null
  start_date: string | null
  end_date: string | null
  hours_count: number | null
  hourly_rate: number | null
  work_time: string | null
  notes: string | null
  status: string
  file_path: string | null
  created_at?: string
  branch_name?: string
  department_name?: string
  subject_name?: string
  subject_code?: string
  group_name?: string
  level_name?: string
  semester_name?: string
}

export interface StudySchedule {
  id: number
  college_id: number
  academic_semester_id: number
  day_of_week: string
  start_time: string
  end_time: string
  study_subject_id: number
  external_employee_id: number | null
  employee_id: number | null
  study_group_id: number | null
  study_level_id: number | null
  room: string | null
  notes: string | null
  created_at?: string
  college_name?: string
  semester_name?: string
  subject_name?: string
  subject_code?: string
  external_employee_name?: string
  employee_name?: string
  group_name?: string
  level_name?: string
  department_id?: number | null
  department_name?: string
}

export interface EmployeeAssignment {
  id: number
  employee_id: number
  branch_id: number | null
  department_id: number | null
  study_subject_id: number | null
  study_group_id: number | null
  study_level_id: number | null
  academic_semester_id: number | null
  created_at?: string
  branch_name?: string
  department_name?: string
  subject_name?: string
  subject_code?: string
  group_name?: string
  level_name?: string
  semester_name?: string
}

// ===================== Common =====================
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// ========================
// Programs (البرامج)
// ========================
export interface Program {
  id: number
  program_name: string
  program_name_en: string | null
  department_id: number | null
  total_hours: number | null
  total_levels: number | null
  status: string
  created_at?: string
  department_name?: string
}

// ========================
// Study Plans (الخطط الدراسية)
// ========================
export interface StudyPlan {
  id: number
  program_id: number
  plan_name: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  created_at?: string
  program_name?: string
}

// ========================
// Plan Subjects (توزيع المواد في الخطة)
// ========================
export interface PlanSubject {
  id: number
  study_plan_id: number
  study_subject_id: number
  study_level_id: number
  semester_id: number | null
  is_required: boolean
  theory_hours: number
  practical_hours: number
  lab_hours: number
  project_hours: number
  created_at?: string
  subject_name?: string
  subject_code?: string
  level_name?: string
}

// ========================
// Subject Relations (المتطلبات السابقة)
// ========================
export interface SubjectRelation {
  id: number
  study_subject_id: number
  related_subject_id: number
  relation_type: 'prerequisite' | 'corequisite'
  created_at?: string
  subject_name?: string
  related_name?: string
}

// ========================
// Buildings (المباني)
// ========================
export interface Building {
  id: number
  building_name: string
  building_code: string | null
  college_id: number | null
  created_at?: string
  college_name?: string
}

// ========================
// Rooms (القاعات)
// ========================
export interface Room {
  id: number
  room_name: string
  room_code: string | null
  building_id: number | null
  room_type: 'theory' | 'lab' | 'workshop' | 'smart'
  capacity: number
  is_available: boolean
  latitude: number | null
  longitude: number | null
  radius: number
  notes: string | null
  created_at?: string
  building_name?: string
}

// ========================
// Lectures (المحاضرات)
// ========================
export interface Lecture {
  id: number
  study_schedule_id: number | null
  study_subject_id: number
  study_group_id: number | null
  program_id: number | null
  study_level_id: number | null
  academic_semester_id: number
  employee_id: number | null
  external_employee_id: number | null
  room_id: number | null
  day_of_week: string
  start_time: string
  end_time: string
  lecture_type: 'theory' | 'practical' | 'lab'
  week_day_number: number | null
  week_number: number | null
  notes: string | null
  status: 'scheduled' | 'cancelled' | 'completed' | 'rescheduled'
  created_at?: string
  subject_name?: string
  subject_code?: string
  group_name?: string
  program_name?: string
  level_name?: string
  semester_name?: string
  employee_name?: string
  external_employee_name?: string
  room_name?: string
  building_name?: string
}

// ========================
// Faculty Preferences (تفضيلات أعضاء التدريس)
// ========================
export interface FacultyPreference {
  id: number
  employee_id: number
  max_hours_per_week: number
  max_hours_per_day: number
  preferred_start_time: string
  preferred_end_time: string
  available_days: string | null
  preferred_building_id: number | null
  break_day: string | null
  notes: string | null
  created_at?: string
  employee_name?: string
  building_name?: string
}

export interface TableFilters {
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  [key: string]: unknown
}

// ===================== Course Syllabi =====================
export interface CourseSyllabus {
  id: number
  study_subject_id: number
  objectives: string | null
  learning_outcomes: string | null
  teaching_methods: string | null
  assessment_methods: string | null
  references: string | null
  weekly_plan: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
  subject_name?: string
  subject_code?: string
}

// ===================== Fee Types =====================
export interface FeeType {
  id: number
  fee_name: string
  fee_name_en: string | null
  fee_code: string | null
  amount: number
  is_recurring: boolean
  recurring_period: string | null
  college_id: number | null
  program_id: number | null
  study_level_id: number | null
  notes: string | null
  status: string
  created_at?: string
  college_name?: string
  program_name?: string
  level_name?: string
}

export interface StudentFee {
  id: number
  student_id: number
  fee_type_id: number
  amount: number
  discount: number
  discount_reason: string | null
  due_date: string | null
  status: string
  paid_amount: number
  remaining_amount: number
  academic_semester_id: number | null
  notes: string | null
  created_at?: string
  fee_name?: string
  student_name?: string
  student_number?: string
  semester_name?: string
}

export interface FeePayment {
  id: number
  student_fee_id: number
  amount: number
  payment_date: string
  payment_method: string
  transaction_id: string | null
  receipt_number: string | null
  notes: string | null
  created_by: number | null
  created_at?: string
  student_id?: number
  student_name?: string
  fee_amount?: number
}

export interface Scholarship {
  id: number
  scholarship_name: string
  scholarship_type: string | null
  discount_percentage: number
  discount_amount: number
  college_id: number | null
  program_id: number | null
  max_students: number | null
  start_date: string | null
  end_date: string | null
  status: string
  notes: string | null
  created_at?: string
  college_name?: string
  program_name?: string
}

// ===================== Attendance =====================
export interface AttendanceSession {
  id: number
  lecture_id: number | null
  study_schedule_id: number | null
  study_subject_id: number | null
  employee_id: number | null
  external_employee_id: number | null
  session_date: string
  start_time: string | null
  end_time: string | null
  session_type: string
  qr_code: string | null
  qr_expires_at: string | null
  room_id: number | null
  status: string
  notes: string | null
  created_at?: string
  subject_name?: string
  day_of_week?: string
  employee_name?: string
  room_name?: string
}

export interface AttendanceRecord {
  id: number
  attendance_session_id: number
  student_id: number
  status: string
  check_in_time: string | null
  check_in_method: string | null
  late_minutes: number
  latitude: number | null
  longitude: number | null
  distance_meters: number | null
  device_id: string | null
  notes: string | null
  created_at?: string
  student_name?: string
  student_number?: string
}

// ===================== Attendance Logs =====================
export interface AttendanceLog {
  id: number
  attendance_session_id: number | null
  student_id: number | null
  action: string
  status: string
  message: string | null
  latitude: number | null
  longitude: number | null
  distance_meters: number | null
  device_id: string | null
  qr_token: string | null
  ip_address: string | null
  created_at: string
  student_name?: string
  student_number?: string
  session_date?: string
}

// ===================== Library =====================
export interface LibraryBook {
  id: number
  title: string
  title_en: string | null
  author: string | null
  publisher: string | null
  isbn: string | null
  edition: string | null
  publication_year: number | null
  category: string | null
  book_type: string
  total_copies: number
  available_copies: number
  shelf_location: string | null
  college_id: number | null
  department_id: number | null
  description: string | null
  cover_image: string | null
  file_path: string | null
  status: string
  created_at?: string
  college_name?: string
  department_name?: string
}

export interface LibraryBorrowing {
  id: number
  book_id: number
  student_id: number | null
  employee_id: number | null
  borrowed_by_type: string
  borrowed_by_name: string | null
  borrowed_by_id_number: string | null
  borrow_date: string
  due_date: string
  return_date: string | null
  renew_count: number
  status: string
  notes: string | null
  created_at?: string
  book_title?: string
  isbn?: string
  author?: string
  student_name?: string
}

export interface LibraryFine {
  id: number
  borrowing_id: number
  fine_type: string
  amount: number
  days_overdue: number
  is_paid: boolean
  payment_date: string | null
  notes: string | null
  created_at?: string
  book_id?: number
  book_title?: string
  student_name?: string
}

export interface LibraryReservation {
  id: number
  book_id: number
  student_id: number | null
  employee_id: number | null
  reserved_by_type: string
  reserved_by_name: string | null
  reservation_date: string
  expiry_date: string | null
  status: string
  notes: string | null
  created_at?: string
  book_title?: string
}

// ===================== Documents =====================
export interface DocumentCategory {
  id: number
  category_name: string
  parent_id: number | null
  sort_order: number
  created_at?: string
  parent_name?: string
}

export interface Document {
  id: number
  title: string
  description: string | null
  category_id: number | null
  document_type: string | null
  file_path: string
  file_size: number | null
  entity_type: string | null
  entity_id: number | null
  tags: string | null
  is_archived: boolean
  is_confidential: boolean
  version: number
  uploaded_by: number | null
  created_at?: string
  updated_at?: string
  category_name?: string
  uploader_name?: string
}

// ===================== Notifications =====================
export interface NotificationTemplate {
  id: number
  template_name: string
  template_key: string | null
  subject: string | null
  body: string
  channels: string
  variables: string | null
  created_at?: string
}

export interface Notification {
  id: number
  recipient_type: string
  recipient_id: number | null
  recipient_email: string | null
  recipient_phone: string | null
  title: string
  body: string
  channel: string
  template_id: number | null
  status: string
  sent_at: string | null
  read_at: string | null
  error_message: string | null
  metadata: Record<string, unknown> | null
  created_at?: string
  template_name?: string
}

// ===================== Academic Records =====================
export interface AcademicRecord {
  id: number
  student_id: number
  study_subject_id: number
  academic_semester_id: number | null
  employee_id: number | null
  study_group_id: number | null
  grade_numeric: number | null
  grade_letter: string | null
  grade_points: number | null
  is_pass: boolean | null
  status: string
  attendance_percentage: number | null
  notes: string | null
  created_at?: string
  updated_at?: string
  student_name?: string
  student_number?: string
  subject_name?: string
  subject_code?: string
  semester_name?: string
  employee_name?: string
}

export interface AcademicWarning {
  id: number
  student_id: number
  warning_type: string
  warning_level: number
  reason: string | null
  gpa_at_warning: number | null
  semester_id: number | null
  issued_by: number | null
  status: string
  resolved_at: string | null
  notes: string | null
  created_at?: string
  student_name?: string
  student_number?: string
  semester_name?: string
  issued_by_name?: string
}

// ===================== Exam Extended =====================
export interface ExamSchedule {
  id: number
  exam_id: number
  room_id: number | null
  exam_date: string | null
  start_time: string | null
  end_time: string | null
  student_count: number
  proctor_id: number | null
  proctor2_id: number | null
  notes: string | null
  status: string
  created_at?: string
  exam_title?: string
  parent_exam_date?: string
  room_name?: string
  capacity?: number
  building_name?: string
  proctor_name?: string
  proctor2_name?: string
}

export interface ExamSeating {
  id: number
  exam_schedule_id: number
  student_id: number
  seat_number: string | null
  row_number: number | null
  column_number: number | null
  attendance_status: string
  check_in_time: string | null
  notes: string | null
  created_at?: string
  student_name?: string
  student_number?: string
}

export interface ExamGrade {
  id: number
  exam_id: number
  student_id: number
  score: number | null
  percentage: number | null
  grade_letter: string | null
  status: string
  graded_by: number | null
  graded_at: string | null
  notes: string | null
  created_at?: string
  exam_title?: string
  student_name?: string
  student_number?: string
}

// ===================== Contractors =====================
export interface Contractor {
  id: number
  full_name: string
  full_name_en: string | null
  identity_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  contract_type: string
  contract_number: string | null
  start_date: string | null
  end_date: string | null
  contract_duration_months: number | null
  salary_amount: number
  allowances: number
  total_amount: number
  payment_frequency: string
  bank_account: string | null
  bank_name: string | null
  tax_number: string | null
  college_id: number | null
  department_id: number | null
  supervisor_id: number | null
  status: string
  notes: string | null
  notify_before_expiry: number
  file_path: string | null
  created_at?: string
  updated_at?: string
  college_name?: string
  department_name?: string
  supervisor_name?: string
}

export interface ContractorDocument {
  id: number
  contractor_id: number
  document_type: string
  document_name: string | null
  file_path: string | null
  issue_date: string | null
  expiry_date: string | null
  notify_before_expiry: number
  is_verified: boolean
  notes: string | null
  created_at?: string
  contractor_name?: string
}

// ===================== University Config/News/Events =====================
export interface UniversityConfig {
  id: number
  config_key: string
  config_value: string | null
  config_group: string
  description: string | null
  created_at?: string
  updated_at?: string
}

export interface UniversityNews {
  id: number
  title: string
  title_en: string | null
  slug: string | null
  summary: string | null
  content: string | null
  image: string | null
  category: string | null
  is_published: boolean
  published_at: string | null
  created_by: number | null
  created_at?: string
  updated_at?: string
  author_name?: string
}

export interface UniversityEvent {
  id: number
  title: string
  title_en: string | null
  slug: string | null
  description: string | null
  event_date: string | null
  event_time: string | null
  location: string | null
  image: string | null
  category: string | null
  is_published: boolean
  created_by: number | null
  created_at?: string
  organizer_name?: string
}

export interface JobOpening {
  id: number
  title: string
  title_en: string | null
  department: string | null
  job_type: string
  description: string | null
  requirements: string | null
  salary_range: string | null
  application_deadline: string | null
  is_published: boolean
  created_by: number | null
  created_at?: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  is_read: boolean
  replied_at: string | null
  created_at?: string
}

// ===================== Time Slots =====================
export interface TimeSlot {
  id: number
  slot_name: string | null
  day_of_week: number
  start_time: string
  end_time: string
  slot_type: string
  college_id: number | null
  is_active: boolean
  created_at?: string
  college_name?: string
}

// ===================== Academic Calendar =====================
export interface AcademicCalendarEvent {
  id: number
  academic_semester_id: number
  event_date: string
  event_type: string
  event_title: string
  event_title_en: string | null
  description: string | null
  is_holiday: boolean
  created_at?: string
  semester_name?: string
}

// ===================== Student Enrollments =====================
export interface StudentEnrollment {
  id: number
  student_id: number
  academic_semester_id: number
  enrollment_type: string
  enrollment_date: string
  study_level_id: number | null
  study_group_id: number | null
  total_hours: number
  max_hours: number | null
  status: string
  notes: string | null
  created_at?: string
  student_name?: string
  student_number?: string
  semester_name?: string
  level_name?: string
  group_name?: string
}

// ===================== Student GPA =====================
export interface StudentSemesterGpa {
  id: number
  student_id: number
  academic_semester_id: number
  semester_hours: number
  semester_gpa: number
  semester_points: number
  cumulative_hours: number
  cumulative_gpa: number
  cumulative_points: number
  calculated_at: string
  student_name?: string
  student_number?: string
  semester_name?: string
}
