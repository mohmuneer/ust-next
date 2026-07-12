-- ============================================================
-- SEED DATA FOR UST PROJECT - Smart University ERP
-- Covers all 81 tables with realistic Arabic demo data
-- Order respects foreign key dependencies
-- Compatible with PostgreSQL (SERIAL) and MySQL (AUTO_INCREMENT)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. branch (الفروع)
-- ============================================================
INSERT INTO branch (branch_name) VALUES
('الفرع الرئيسي - صنعاء'),
('فرع عدن'),
('فرع تعز'),
('فرع حضرموت'),
('فرع ذمار');

-- ============================================================
-- 2. colleges (الكليات) FK->branch
-- ============================================================
INSERT INTO colleges (college_name, branch_id) VALUES
('كلية الهندسة', 1),
('كلية علوم الحاسوب', 1),
('كلية الطب', 1),
('كلية العلوم الإدارية', 1),
('كلية الهندسة - عدن', 2),
('كلية علوم الحاسوب - عدن', 2),
('كلية الطب - تعز', 3);

-- ============================================================
-- 3. departments (الأقسام) FK->colleges
-- ============================================================
INSERT INTO departments (department_name, college_id) VALUES
('هندسة البرمجيات', 1),
('هندسة الشبكات', 1),
('هندسة مدنية', 1),
('علوم حاسوب', 2),
('نظم معلومات', 2),
('تقنية معلومات', 2),
('طب عام', 3),
('جراحة', 3),
('محاسبة', 4),
('إدارة أعمال', 4),
('تسويق', 4);

-- ============================================================
-- 4. labs (المعامل) FK->colleges
-- ============================================================
INSERT INTO labs (lab_name, college_id) VALUES
('معمل الحاسوب 1', 2),
('معمل الحاسوب 2', 2),
('معمل الشبكات', 1),
('معمل البرمجيات', 1),
('معمل التشريح', 3),
('معمل الكيمياء', 3),
('معمل الهندسة', 1);

-- ============================================================
-- 5. study_levels (المستويات الدراسية)
-- ============================================================
INSERT INTO study_levels (level_name) VALUES
('المستوى الأول'),
('المستوى الثاني'),
('المستوى الثالث'),
('المستوى الرابع'),
('المستوى الخامس'),
('المستوى السادس');

-- ============================================================
-- 6. study_groups (المجموعات الدراسية) FK->colleges
-- ============================================================
INSERT INTO study_groups (group_name, group_type, college_id) VALUES
('A', 'نظري', 1),
('B', 'نظري', 1),
('C', 'عملي', 1),
('A', 'نظري', 2),
('B', 'نظري', 2),
('A', 'نظري', 3),
('B', 'نظري', 3);

-- ============================================================
-- 7. academic_semesters (الترم الدراسي)
-- ============================================================
INSERT INTO academic_semesters (semester_name, start_date, end_date, is_current) VALUES
('الفصل الأول 2025-2026', '2025-09-01', '2026-01-15', true),
('الفصل الثاني 2025-2026', '2026-02-01', '2026-06-15', false),
('الفصل الصيفي 2026', '2026-07-01', '2026-08-31', false),
('الفصل الأول 2026-2027', '2026-09-01', '2027-01-15', false);

-- ============================================================
-- 8. study_subjects (المواد الدراسية) FK->colleges,departments,levels,groups,semesters
-- ============================================================
INSERT INTO study_subjects (subject_name, subject_code, college_id, department_id, study_level_id, study_group_id, academic_semester_id, weekly_hours) VALUES
('مقدمة في البرمجة', 'CS101', 2, 4, 1, 4, 1, 3),
('هياكل البيانات', 'CS201', 2, 4, 2, 4, 1, 3),
('قواعد البيانات', 'CS301', 2, 4, 3, 5, 1, 3),
('هندسة البرمجيات', 'SE301', 1, 1, 3, 1, 1, 3),
('شبكات الحاسوب', 'NT201', 1, 2, 2, 2, 1, 3),
('رياضيات هندسية', 'MATH101', 1, 1, 1, 1, 1, 3),
('فيزياء هندسية', 'PHY101', 1, 1, 1, 1, 1, 2),
('تحليل وتصميم نظم', 'IS301', 2, 5, 3, 5, 1, 3),
('أمن المعلومات', 'CS401', 2, 4, 4, 4, 1, 3),
('ذكاء اصطناعي', 'CS402', 2, 4, 4, 5, 1, 3),
('محاسبة مالية', 'ACC101', 4, 9, 1, NULL, 1, 3),
('إدارة استراتيجية', 'MGT301', 4, 10, 3, NULL, 1, 3),
('تشريح بشري', 'MED101', 3, 7, 1, 6, 1, 4),
('علم الأدوية', 'MED201', 3, 7, 2, 6, 1, 3),
('هندسة مدنية 1', 'CE101', 1, 3, 1, 3, 1, 3),
('تسويق إلكتروني', 'MKT301', 4, 11, 3, NULL, 1, 2);

-- ============================================================
-- 9. groups (problem categories = issue types)
-- ============================================================
INSERT INTO groups (group_name) VALUES
('مشاكل تقنية'),
('مشاكل إدارية'),
('مشاكل أكاديمية'),
('مشاكل مالية'),
('طلبات صيانة'),
('استفسارات عامة'),
('شكاوى واقتراحات');

-- ============================================================
-- 10. default_problems (default problems) FK->groups
-- ============================================================
INSERT INTO default_problems (group_id, problem_name) VALUES
(1, 'عطل في جهاز الحاسوب'),
(1, 'بطء في الشبكة'),
(1, 'عطل في الطابعة'),
(1, 'مشكلة في البريد الإلكتروني'),
(1, 'عطل في جهاز العرض'),
(2, 'تأخر في المعاملة'),
(2, 'خطأ في البيانات'),
(3, 'استفسار عن النتائج'),
(3, 'مشكلة في الجدول'),
(4, 'تأخر في صرف المستحقات'),
(4, 'خطأ في الفاتورة'),
(5, 'صيانة مكيف'),
(5, 'صيانة كهرباء'),
(5, 'صيانة سباكة'),
(6, 'استفسار عام'),
(7, 'شكوى');

-- ============================================================
-- 11. roles
-- ============================================================
INSERT INTO roles (role_name, role_code) VALUES
('مدير النظام', 'admin'),
('مسؤول النظام', 'super_admin'),
('رئيس قسم', 'hod'),
('أستاذ', 'professor'),
('موظف شؤون طلاب', 'student_affairs'),
('موظف مالي', 'finance'),
('مشرف تقنية', 'it_support'),
('فني', 'technician'),
('مستخدم عادي', 'user');

-- ============================================================
-- 12. users FK->roles (via user_permision)
-- ============================================================
INSERT INTO users (full_name, email, password, status, view_personal_tasks, view_group_tasks) VALUES
('أحمد محمد', 'admin@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('سارة علي', 'sara@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('محمد حسن', 'mohamed@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('فاطمة أحمد', 'fatima@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('خالد عمر', 'khalid@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('نورة عبدالله', 'noura@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('علي صالح', 'ali@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('مريم حسين', 'maryam@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1),
('يوسف إبراهيم', 'yousuf@ust.edu.ye', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 1);

-- password for all: password

-- ============================================================
-- 13. user_permision (user role assignment) FK->users,roles
-- ============================================================
INSERT INTO user_permision (user_id, role_id) VALUES
(1, 2), -- أحمد -> super_admin
(2, 3), -- سارة -> hod
(3, 4), -- محمد -> professor
(4, 4), -- فاطمة -> professor
(5, 5), -- خالد -> student_affairs
(6, 6), -- نورة -> finance
(7, 7), -- علي -> it_support
(8, 8), -- مريم -> technician
(9, 9); -- يوسف -> user

-- ============================================================
-- 14. system_settings
-- ============================================================
INSERT INTO system_settings (system_name, admin_email, contact_number, address, system_logo, maintenance_mode) VALUES
('جامعة العلوم والتكنولوجيا - نظام إدارة الجامعة', 'admin@ust.edu.ye', '967123456789+', 'صنعاء - اليمن', NULL, 0);

-- ============================================================
-- 15. system_visuals
-- ============================================================
INSERT INTO system_visuals (system_font, sidebar_color, header_color, main_color, add_btn_color, print_btn_color, delete_btn_color, card_color) VALUES
('Cairo', '#1e272e', '#ffffff', '#038ed3', '#28a745', '#17a2b8', '#dc3545', '#038ed3');

-- ============================================================
-- 16. admin_structures (الهيكل الإداري)
-- ============================================================
INSERT INTO admin_structures (name, parent_id, sort_order) VALUES
('إدارة الجامعة', NULL, 1),
('عمادة كلية الهندسة', 1, 2),
('عمادة كلية علوم الحاسوب', 1, 3),
('عمادة كلية الطب', 1, 4),
('عمادة كلية العلوم الإدارية', 1, 5),
('قسم هندسة البرمجيات', 2, 1),
('قسم علوم الحاسوب', 3, 1),
('قسم نظم المعلومات', 3, 2),
('قسم طب عام', 4, 1),
('قسم محاسبة', 5, 1);

-- ============================================================
-- 17. job_titles
-- ============================================================
INSERT INTO job_titles (title) VALUES
('عميد كلية'),
('رئيس قسم'),
('أستاذ دكتور'),
('أستاذ مساعد'),
('محاضر'),
('معيد'),
('موظف إداري'),
('فني مختبر'),
('أمين مكتبة'),
('محاسب');

-- ============================================================
-- 18. employees FK->admin_structures,job_titles
-- ============================================================
INSERT INTO employees (employee_code, full_name, email, phone, admin_structure_id, job_title_id, academic_degree, specialization, status) VALUES
('EMP001', 'د. أحمد محمد علي', 'ahmad.ali@ust.edu.ye', '777111222', 2, 1, 'دكتوراه', 'هندسة برمجيات', 'active'),
('EMP002', 'د. سارة عبدالله', 'sara.abdullah@ust.edu.ye', '777222333', 6, 2, 'دكتوراه', 'هندسة برمجيات', 'active'),
('EMP003', 'د. محمد حسن', 'mohamed.hassan@ust.edu.ye', '777333444', 7, 3, 'دكتوراه', 'علوم حاسوب', 'active'),
('EMP004', 'د. فاطمة أحمد', 'fatima.ahmed@ust.edu.ye', '777444555', 8, 4, 'دكتوراه', 'نظم معلومات', 'active'),
('EMP005', 'م. خالد عمر', 'khalid.omar@ust.edu.ye', '777555666', 6, 5, 'ماجستير', 'هندسة برمجيات', 'active'),
('EMP006', 'أ. نورة عبدالله', 'noura.abdullah@ust.edu.ye', '777666777', 10, 10, 'ماجستير', 'محاسبة', 'active'),
('EMP007', 'م. علي صالح', 'ali.saleh@ust.edu.ye', '777777888', 7, 5, 'ماجستير', 'شبكات', 'active'),
('EMP008', 'م. مريم حسين', 'maryam.hussein@ust.edu.ye', '777888999', 6, 8, 'بكالوريوس', 'تقنية معلومات', 'active');

-- ============================================================
-- 19. employee_certificates FK->employees
-- ============================================================
INSERT INTO employee_certificates (employee_id, certificate_name, issuing_authority, year) VALUES
(1, 'شهادة دكتوراه في هندسة البرمجيات', 'جامعة القاهرة', '2015'),
(2, 'شهادة دكتوراه في علوم الحاسوب', 'جامعة الملك سعود', '2018'),
(3, 'شهادة دكتوراه في الذكاء الاصطناعي', 'جامعة الملك فهد', '2020'),
(4, 'شهادة دكتوراه في نظم المعلومات', 'جامعة عدن', '2019'),
(5, 'شهادة ماجستير في هندسة البرمجيات', 'جامعة صنعاء', '2021'),
(6, 'شهادة ماجستير في المحاسبة', 'جامعة صنعاء', '2020'),
(1, 'شهادة PMP项目管理', 'PMI', '2019'),
(3, 'شهادة CCNA', 'Cisco', '2021');

-- ============================================================
-- 20. employee_assignments FK->employees,branch,departments,subjects,groups,levels,semesters
-- ============================================================
INSERT INTO employee_assignments (employee_id, branch_id, department_id, study_subject_id, study_group_id, study_level_id, academic_semester_id) VALUES
(1, 1, 1, 1, 1, 1, 1),
(2, 1, 1, 4, 1, 3, 1),
(3, 1, 4, 2, 4, 2, 1),
(4, 1, 5, 8, 5, 3, 1),
(5, 1, 1, 1, 2, 1, 1),
(7, 1, 4, 5, 5, 2, 1);

-- ============================================================
-- 21. external_employees FK->branch,departments,subjects,groups,levels,semesters
-- ============================================================
INSERT INTO external_employees (full_name, email, phone, password, contract_type, branch_id, department_id, study_subject_id, study_group_id, study_level_id, academic_semester_id, start_date, end_date, hours_count, hourly_rate, work_time, notes, status) VALUES
('د. وليد الحضرمي', 'waleed@example.com', '777999000', '$2y$10$QkfnZ9tRdriQWw8mGdTpYeoOscJfdqGyFjoekW0n85DW8HfOSQT6O', 'semester', 1, 1, 4, 1, 3, 1, '2025-09-01', '2026-01-15', 48, 5000, 'الأحد والثلاثاء 10-12', 'محاضر خارجي - هندسة البرمجيات', 'active'),
('د. سارة القحطاني', 'sara@example.com', '777111222', '$2y$10$F3ChYCkEYuzphqn9BIjAxOSX.jur6GtiSumgym8/x7bcPpHBaHKvi', 'semester', 1, 4, 1, 4, 1, 1, '2025-09-01', '2026-01-15', 42, 5500, 'السبت والاثنين 10-12', 'محاضرة خارجية - مقدمة البرمجة', 'active'),
('م. سامي النجار', 'sami@example.com', '777222333', '$2y$10$Qmss7wsDLaNEJmjhbZDeeu7SOdSxy/MIUFBX7vErVs76Ig61qaPhO', 'semester', 1, 2, 5, 2, 2, 1, '2025-09-01', '2026-01-15', 36, 4500, 'الإثنين والأربعاء 8-10', 'محاضر متعاقد - شبكات الحاسوب', 'active'),
('د. فاطمة الزهراء', 'fatima@example.com', '777333444', '$2y$10$alhdO6dujFxyTZg8gXi2/.4ucVqxo0tDwpHMdaU4hYrAWdvxCKbYO', 'semester', 1, 1, 9, 1, 4, 1, '2025-09-01', '2026-01-15', 30, 4800, 'الأحد والثلاثاء 2-4', 'محاضرة خارجية - أمن المعلومات', 'active'),
('د. خالد العمري', 'khalid@example.com', '777444555', '$2y$10$qG7fljhia5eWbQ8D1kREb.srY0hw3AF9PyQmDHVhZ6Xu9tF5NFowC', 'yearly', 1, 5, 8, 5, 3, 1, '2025-09-01', '2026-06-30', 60, 6000, 'السبت-الثلاثاء 8-10', 'محاضر رئيسي - تحليل وتصميم نظم', 'active'),
('م. نورة الشمري', 'noura@example.com', '777555666', '$2y$10$OaoTcM8NKVjvQkoJGmE4z.gj6M64BhdA.JKGxzxloyw7NUyRqRToW', 'monthly', 1, 10, 12, 3, 3, 1, '2025-09-01', '2026-01-15', 24, 4200, 'الإثنين والأربعاء 4-6', 'محاضرة متعاقدة - إدارة استراتيجية', 'active'),
('د. محمد الحربي', 'mohammed@example.com', '777666777', '$2y$10$hY/e5B6R0j/g4WjBs72ZuejFXAvAG2LpWcSsV7MNOQv4w0GtkMkFC', 'semester', 1, 4, 10, 4, 4, 1, '2025-09-01', '2026-01-15', 38, 5200, 'الأحد والإثنين 10-12', 'محاضر خارجي - الذكاء الاصطناعي', 'active'),
('د. ريم السالم', 'reem@example.com', '777777888', '$2y$10$I/yXS9cPbjylkQaBu.i5Ze3ZpKkVfNF20KusJNyUWuWWOFAeCMEve', 'semester', 1, 4, 2, 4, 2, 1, '2025-09-01', '2026-01-15', 32, 4600, 'الثلاثاء والأربعاء 2-4', 'محاضرة خارجية - هياكل البيانات', 'active'),
('م. عبدالرحمن الفهد', 'abdulrahman@example.com', '777888999', '$2y$10$APPoEdmFienLPXAIVfAgYuL8rRJY.aK0QQStfkgfpcb75kkul9WAe', 'semester', 1, 9, 11, 6, 3, 1, '2025-09-01', '2026-01-15', 30, 4400, 'السبت والاثنين 8-10', 'محاضر متعاقد - محاسبة مالية', 'active'),
('د. هند المطيري', 'hind@example.com', '777900111', '$2y$10$qGemkI8sS15hBXMVUuUpQOz8CNWNhNbVrJ9BOrP26n5xoC5uOOqnq', 'semester', 1, 7, 13, 6, 1, 1, '2025-09-01', '2026-01-15', 45, 5800, 'الأحد-الثلاثاء 8-10', 'محاضرة خارجية - تشريح بشري', 'active'),
('م. أحمد الصقر', 'ahmad.s@example.com', '777911222', '$2y$10$9oMfsbuQELdQi/Gl8GdQAOjMVvEoMnQ85Z1wAAmnio8MOuBtD2wxe', 'monthly', 1, 3, 15, 3, 1, 1, '2025-09-01', '2026-01-15', 20, 4000, 'الإثنين والأربعاء 10-12', 'محاضر متعاقد - هندسة مدنية', 'active'),
('د. لمياء الحارثي', 'lamia@example.com', '777922333', '$2y$10$p6lINNZBisT0474s8FVcgekAbGqupM/VNYhCmkUt6l./6Gu7b67j.', 'yearly', 1, 11, 16, 4, 3, 1, '2025-09-01', '2026-06-30', 55, 5400, 'السبت-الاثنين 2-4', 'محاضرة خارجية - تسويق إلكتروني', 'active'),
('م. ياسر الدوسري', 'yasser@example.com', '777933444', '$2y$10$HpoYzRfTksPMTAaJIGcKKe0X3DEOE.ptI8vTzxgdjxyPz6VXLH4aO', 'semester', 2, 1, 4, 1, 3, 1, '2025-09-01', '2026-01-15', 35, 4700, 'الإثنين والأربعاء 10-12', 'محاضر متعاقد - فرع عدن', 'active'),
('د. عبير الشمري', 'abeer@example.com', '777944555', '$2y$10$fJIoBDALmPFYhGj2yYsffeRJkw/xn2mNWLISEdj.xRGniDaQJYPgS', 'semester', 3, 4, 10, 4, 2, 1, '2025-09-01', '2026-01-15', 28, 4300, 'الثلاثاء والأربعاء 8-10', 'محاضرة خارجية - فرع تعز', 'active'),
('م. عمر البكري', 'omar@example.com', '777955666', '$2y$10$yu/O83Xk9LY/3stFvjqn5uPh3Ovodvv32QdXZIIS3ZKKSk.7wYEOi', 'monthly', 1, 5, 3, 5, 3, 1, '2025-09-01', '2026-01-15', 22, 4100, 'السبت والاثنين 2-4', 'محاضرة متعاقدة - قواعد البيانات', 'active'),
('د. مها العتيبي', 'maha@example.com', '777966777', '$2y$10$kyrl0pmvi1LpVbwp9ps6WObBr/.ZFS.FhvTvOicgU5wfscqf/YiYO', 'semester', 1, 4, 6, 4, 3, 1, '2025-09-01', '2026-01-15', 40, 5100, 'الأحد والثلاثاء 4-6', 'محاضرة خارجية - قواعد البيانات المتقدمة', 'active');

-- ============================================================
-- 22. programs FK->departments
-- ============================================================
INSERT INTO programs (program_name, program_name_en, department_id, total_hours, total_levels, status) VALUES
('بكالوريوس هندسة البرمجيات', 'BSc Software Engineering', 1, 160, 4, 'active'),
('بكالوريوس علوم الحاسوب', 'BSc Computer Science', 4, 160, 4, 'active'),
('بكالوريوس نظم المعلومات', 'BSc Information Systems', 5, 160, 4, 'active'),
('بكالوريوس المحاسبة', 'BSc Accounting', 9, 140, 4, 'active'),
('بكالوريوس الطب والجراحة', 'MBBS', 7, 280, 6, 'active');

-- ============================================================
-- 23. study_plans FK->programs
-- ============================================================
INSERT INTO study_plans (program_id, plan_name, start_date, end_date, is_current) VALUES
(1, 'خطة هندسة البرمجيات 2025', '2025-09-01', '2029-08-31', true),
(2, 'خطة علوم الحاسوب 2025', '2025-09-01', '2029-08-31', true),
(3, 'خطة نظم المعلومات 2025', '2025-09-01', '2029-08-31', true);

-- ============================================================
-- 24. plan_subjects FK->study_plans,subjects,levels,semesters
-- ============================================================
INSERT INTO plan_subjects (study_plan_id, study_subject_id, study_level_id, semester_id, is_required, theory_hours, practical_hours, lab_hours, project_hours) VALUES
(1, 1, 1, 1, true, 2, 0, 1, 0),
(1, 4, 3, 1, true, 2, 0, 1, 0),
(1, 6, 1, 1, true, 3, 0, 0, 0),
(1, 7, 1, 1, true, 2, 1, 0, 0),
(2, 1, 1, 1, true, 2, 0, 1, 0),
(2, 2, 2, 1, true, 2, 0, 1, 0),
(2, 3, 3, 1, true, 2, 0, 1, 0),
(3, 8, 3, 1, true, 2, 0, 1, 0);

-- ============================================================
-- 25. subject_relations FK->study_subjects
-- ============================================================
INSERT INTO subject_relations (study_subject_id, related_subject_id, relation_type) VALUES
(2, 1, 'prerequisite'),
(3, 2, 'prerequisite'),
(4, 1, 'prerequisite'),
(5, 7, 'prerequisite'),
(9, 5, 'prerequisite'),
(10, 2, 'prerequisite');

-- ============================================================
-- 26. buildings FK->colleges
-- ============================================================
INSERT INTO buildings (building_name, building_code, college_id) VALUES
('مبنى A - الهندسة', 'A', 1),
('مبنى B - علوم الحاسوب', 'B', 2),
('مبنى C - الطب', 'C', 3),
('مبنى D - الإدارة', 'D', 4),
('المكتبة المركزية', 'LIB', NULL),
('مبنى المعامل', 'LAB', NULL);

-- ============================================================
-- 27. rooms FK->buildings
-- ============================================================
INSERT INTO rooms (room_name, room_code, building_id, room_type, capacity, is_available, notes) VALUES
('قاعة A101', 'A101', 1, 'theory', 50, true, 'قاعة محاضرات'),
('قاعة A102', 'A102', 1, 'lab', 30, true, 'معمل حاسوب'),
('قاعة B201', 'B201', 2, 'theory', 60, true, 'قاعة محاضرات'),
('قاعة B202', 'B202', 2, 'lab', 25, true, 'معمل برمجيات'),
('قاعة C301', 'C301', 3, 'theory', 100, true, 'مدرج'),
('مختبر تشريح', 'C302', 3, 'lab', 40, true, 'مختبر تشريح'),
('قاعة D401', 'D401', 4, 'theory', 45, true, 'قاعة إدارة'),
('مكتبة رئيسية', 'LIB01', 5, 'theory', 200, true, 'قاعة مطالعة'),
('معمل شبكات', 'B203', 2, 'lab', 20, true, 'معمل شبكات متخصص'),
('ورشة هندسة', 'A103', 1, 'workshop', 35, true, 'ورشة تدريب عملي');

-- ============================================================
-- 28. faculty_preferences FK->employees,buildings
-- ============================================================
INSERT INTO faculty_preferences (employee_id, max_hours_per_week, max_hours_per_day, preferred_start_time, preferred_end_time, available_days, preferred_building_id, break_day, notes) VALUES
(1, 18, 6, '08:00', '14:00', 'الأحد,الإثنين,الثلاثاء,الأربعاء', 1, 'الخميس', NULL),
(2, 15, 4, '09:00', '13:00', 'الأحد,الثلاثاء,الخميس', 1, 'الإثنين', NULL),
(3, 18, 6, '08:00', '16:00', 'الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس', 2, NULL, NULL),
(4, 12, 4, '10:00', '14:00', 'الإثنين,الأربعاء', 2, 'الأحد', 'ساعات محدودة'),
(5, 20, 6, '07:00', '15:00', 'السبت,الأحد,الإثنين,الثلاثاء,الأربعاء', 1, 'الخميس', NULL),
(7, 15, 5, '08:00', '13:00', 'الأحد,الإثنين,الثلاثاء,الأربعاء', 2, 'الخميس', NULL);

-- ============================================================
-- 29. study_schedules FK->colleges,semesters,subjects,employees,groups,levels
-- ============================================================
INSERT INTO study_schedules (college_id, academic_semester_id, day_of_week, start_time, end_time, study_subject_id, employee_id, external_employee_id, study_group_id, study_level_id, room, notes) VALUES
(2, 1, 'Sunday', '08:00', '10:00', 1, 3, NULL, 4, 1, 'B201', NULL),
(2, 1, 'Sunday', '10:00', '12:00', 2, 3, NULL, 4, 2, 'B201', NULL),
(1, 1, 'Sunday', '08:00', '10:00', 4, 2, NULL, 1, 3, 'A101', NULL),
(1, 1, 'Monday', '08:00', '10:00', 1, 5, NULL, 2, 1, 'A101', 'مجموعة B'),
(2, 1, 'Tuesday', '08:00', '10:00', 3, NULL, 1, 4, 3, 'B202', NULL),
(2, 1, 'Wednesday', '10:00', '12:00', 8, 4, NULL, 5, 3, 'B201', NULL),
(2, 1, 'Thursday', '08:00', '10:00', 5, 7, NULL, 5, 2, 'B203', NULL),
(1, 1, 'Sunday', '10:00', '12:00', 6, 1, NULL, 1, 1, 'A101', 'رياضيات'),
(1, 1, 'Monday', '12:00', '14:00', 7, 1, NULL, 1, 1, 'A102', 'فيزياء');

-- ============================================================
-- 30. lectures FK->schedules,subjects,groups,programs,levels,semesters,employees,rooms
-- ============================================================
INSERT INTO lectures (study_schedule_id, study_subject_id, study_group_id, program_id, study_level_id, academic_semester_id, employee_id, room_id, day_of_week, start_time, end_time, lecture_type, status)
SELECT
  ss.id, ss.study_subject_id, ss.study_group_id, p.id, ss.study_level_id, ss.academic_semester_id,
  ss.employee_id, r.id, ss.day_of_week, ss.start_time, ss.end_time, 'theory', 'scheduled'
FROM study_schedules ss
CROSS JOIN LATERAL (SELECT id FROM programs LIMIT 1) p
CROSS JOIN LATERAL (SELECT id FROM rooms WHERE room_code = ss.room LIMIT 1) r
WHERE ss.employee_id IS NOT NULL;

-- ============================================================
-- 31. students FK->colleges,departments,levels,groups,semesters
-- ============================================================
INSERT INTO students (student_number, full_name, email, phone, college_id, department_id, study_level_id, study_group_id, academic_semester_id, status, total_earned_hours, total_gpa_points, cumulative_gpa, academic_status, enrollment_date, expected_graduation_date, nationality, birth_date, gender, address) VALUES
('2024001', 'أحمد خالد عبدالله', 'ahmed.khaled@stu.ust.edu.ye', '771234567', 2, 4, 1, 4, 1, 'active', 15, 45.5, 3.03, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-03-15', 'ذكر', 'صنعاء'),
('2024002', 'سارة محمد علي', 'sara.mohamed@stu.ust.edu.ye', '772345678', 2, 4, 1, 4, 1, 'active', 15, 52.5, 3.50, 'active', '2025-09-01', '2029-06-15', 'يمنية', '2006-07-20', 'أنثى', 'صنعاء'),
('2024003', 'عمر حسن أحمد', 'omar.hassan@stu.ust.edu.ye', '773456789', 1, 1, 1, 1, 1, 'active', 15, 48.0, 3.20, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-11-10', 'ذكر', 'صنعاء'),
('2024004', 'نور الدين صالح', 'noor.saleh@stu.ust.edu.ye', '774567890', 1, 1, 1, 2, 1, 'active', 15, 39.0, 2.60, 'active', '2025-09-01', '2029-06-15', 'يمني', '2006-01-05', 'ذكر', 'عدن'),
('2023005', 'مريم عبدالرحمن', 'maryam.abdo@stu.ust.edu.ye', '775678901', 2, 4, 2, 4, 1, 'active', 30, 96.0, 3.20, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-09-15', 'أنثى', 'تعز'),
('2023006', 'علي عبدالله محسن', 'ali.abdullah@stu.ust.edu.ye', '776789012', 2, 5, 2, 5, 1, 'active', 30, 102.0, 3.40, 'active', '2024-09-01', '2028-06-15', 'يمني', '2004-04-20', 'ذكر', 'صنعاء'),
('2023007', 'فاطمة حسين', 'fatima.hussein@stu.ust.edu.ye', '777890123', 1, 1, 3, 1, 1, 'active', 45, 135.0, 3.00, 'active', '2023-09-01', '2027-06-15', 'يمنية', '2003-12-01', 'أنثى', 'ذمار'),
('2022008', 'خالد محمد غالب', 'khalid.ghaleb@stu.ust.edu.ye', '778901234', 2, 5, 3, 5, 1, 'active', 60, 192.0, 3.20, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-06-10', 'ذكر', 'صنعاء'),
('2022009', 'يوسف إبراهيم', 'yousuf.ibrahim@stu.ust.edu.ye', '779012345', 2, 4, 4, 4, 1, 'active', 75, 262.5, 3.50, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-08-25', 'ذكر', 'عدن'),
('2022010', 'هدى عبدالله', 'huda.abdullah@stu.ust.edu.ye', '770123456', 1, 3, 3, 3, 1, 'active', 45, 130.5, 2.90, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2003-02-14', 'أنثى', 'صنعاء'),
('2025001', 'أسامة طارق', 'osama.tariq@stu.ust.edu.ye', '771111111', 3, 7, 1, 6, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2031-06-15', 'يمني', '2006-05-30', 'ذكر', 'صنعاء'),
('2025002', 'رنا أحمد', 'rana.ahmed@stu.ust.edu.ye', '772222222', 3, 7, 1, 6, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2031-06-15', 'يمنية', '2007-01-15', 'أنثى', 'صنعاء'),
('2025003', 'زياد عمر', 'ziyad.omar@stu.ust.edu.ye', '773333333', 4, 9, 1, NULL, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-09-20', 'ذكر', 'إب'),
('2023004', 'سامية حسن', 'samia.hassan@stu.ust.edu.ye', '774444444', 4, 10, 3, NULL, 1, 'active', 30, 90.0, 3.00, 'active', '2023-09-01', '2027-06-15', 'يمنية', '2003-07-11', 'أنثى', 'حجة');

-- ============================================================
-- 32. guardians FK->students
-- ============================================================
INSERT INTO guardians (full_name, phone, email, address, relation_type) VALUES
('خالد عبدالله', '771234567', 'khaled@example.com', 'صنعاء', 'أب'),
('محمد علي', '772345678', 'mohamed@example.com', 'صنعاء', 'أب'),
('حسن أحمد', '773456789', 'hassan@example.com', 'صنعاء', 'أب'),
('صالح عبدالله', '774567890', 'saleh@example.com', 'عدن', 'أب'),
('عبدالرحمن علي', '775678901', 'abdo@example.com', 'تعز', 'أب');

INSERT INTO guardian_students (guardian_id, student_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

-- ============================================================
-- 33. exams FK->study_subjects
-- ============================================================
INSERT INTO exams (title, subject_id, duration_minutes, total_marks, pass_mark, exam_date, start_time, status) VALUES
('اختبار منتصف الفصل - برمجة', 1, 60, 100, 50, '2025-11-01', '10:00', 'published'),
('اختبار نهائي - برمجة', 1, 120, 100, 50, '2026-01-10', '09:00', 'draft'),
('اختبار منتصف الفصل - هياكل بيانات', 2, 60, 100, 50, '2025-11-05', '10:00', 'published'),
('اختبار منتصف الفصل - قواعد بيانات', 3, 60, 100, 50, '2025-11-10', '10:00', 'published'),
('اختبار منتصف الفصل - هندسة برمجيات', 4, 60, 100, 50, '2025-11-03', '10:00', 'published'),
('اختبار نهائي - رياضيات', 6, 90, 100, 50, '2026-01-05', '09:00', 'draft'),
('اختبار عملي - برمجة', 1, 90, 50, 25, '2025-11-15', '14:00', 'published');

-- ============================================================
-- 34. exam_questions FK->exams
-- ============================================================
INSERT INTO exam_questions (exam_id, question_text, question_type, options, correct_answer, marks, sort_order) VALUES
(1, 'ما هو الناتج: console.log(typeof 42)؟', 'multiple_choice', '["number","string","boolean","undefined"]', 'number', 5, 1),
(1, 'أي من التالي يستخدم لإنشاء متغير في JavaScript؟', 'multiple_choice', '["var","let","const","جميع ما سبق"]', 'جميع ما سبق', 5, 2),
(1, 'ما هي وظيفة الأقواس {} في JavaScript؟', 'multiple_choice', '["كتلة برمجية","مصفوفة","دالة","كائن"]', 'كتلة برمجية', 5, 3),
(1, 'اشرح مفهوم التكرار (Recursion) مع مثال.', 'essay', NULL, NULL, 15, 4),
(2, 'ما هو التعقيد الزمني للبحث الثنائي؟', 'multiple_choice', '["O(n)","O(log n)","O(n²)","O(1)"]', 'O(log n)', 5, 1),
(2, 'ما هي بنية البيانات المناسبة لتطبيق طابور (Queue)؟', 'multiple_choice', '["مصفوفة","قائمة مرتبطة","كلا الخيارين","لا شيء"]', 'كلا الخيارين', 5, 2),
(3, 'أي لغة استعلام تُستخدم مع قواعد البيانات العلائقية؟', 'multiple_choice', '["SQL","NoSQL","JSON","XML"]', 'SQL', 5, 1),
(3, 'ما هو المفتاح الأساسي (Primary Key)؟', 'multiple_choice', '["حقل فريد لكل سجل","حقل يربط جدولين","حقل اختياري","مفتاح أجنبي"]', 'حقل فريد لكل سجل', 5, 2);

-- ============================================================
-- 35. requests FK->branch,colleges,labs,groups
-- ============================================================
INSERT INTO requests (user_id_number, branch_id, college_id, lab_id, location_name, issue_type_id, study_level_id, department_id, course_name, priority, details, status, created_at) VALUES
('2024001', 1, 2, 1, 'معمل الحاسوب 1', 1, 1, 4, 'برمجة', 'High', 'جهاز رقم 5 لا يعمل', 'Resolved', '2025-10-01 08:30:00'),
('2024002', 1, 2, 1, 'معمل الحاسوب 2', 1, 1, 4, 'هياكل بيانات', 'Medium', 'بطء شديد في الشبكة', 'In Progress', '2025-10-05 09:15:00'),
('EMP001', 1, 1, NULL, 'مكتب الدكتور أحمد', 2, NULL, NULL, NULL, 'Low', 'طلب تحديث برنامج', 'Pending', '2025-10-10 11:00:00'),
('2023005', 1, 2, 2, 'قاعة B202', 3, 2, 4, 'قواعد بيانات', 'Medium', 'استفسار عن نتيجة الامتحان', 'Resolved', '2025-10-12 10:30:00'),
('2024003', 1, 1, NULL, 'قاعة A101', 5, 1, 1, 'رياضيات', 'High', 'مكيف الهواء لا يعمل', 'Pending', '2025-10-15 13:00:00');

-- ============================================================
-- 36. tasks FK->requests,users
-- ============================================================
INSERT INTO tasks (request_id, assigned_to, created_by, title, details, priority, status, created_at) VALUES
(1, 7, 1, 'إصلاح جهاز كمبيوتر', 'إصلاح الجهاز رقم 5 في معمل الحاسوب 1', 'High', 'Completed', '2025-10-01 09:00:00'),
(2, 8, 1, 'فحص مشكلة الشبكة', 'التحقق من بطء الشبكة في معمل الحاسوب 2', 'Medium', 'In Progress', '2025-10-05 10:00:00'),
(3, 7, 1, 'تحديث البرامج', 'تحديث برامج مكتب الدكتور أحمد', 'Normal', 'Pending', '2025-10-10 11:30:00'),
(5, 8, 1, 'صيانة مكيف', 'إصلاح مكيف الهواء في قاعة A101', 'High', 'Pending', '2025-10-15 13:30:00');

-- ============================================================
-- 37. sidebar_menu
-- ============================================================
INSERT INTO sidebar_menu (title, icon, link, parent_id, permission_key, sort_order) VALUES
('لوحة التحكم', 'LayoutDashboard', '/dashboard', 0, NULL, 1),
('دليل التهيئة', 'ListChecks', '/setup-workflow', 0, NULL, 2),
('الفروع', 'Building2', NULL, 0, NULL, 3),
('تصنيفات المشاكل', 'Tags', NULL, 0, NULL, 4),
('البلاغات', 'ClipboardList', NULL, 0, NULL, 5),
('المهام', 'FileText', NULL, 0, NULL, 6),
('بيانات الطلاب', 'GraduationCap', NULL, 0, NULL, 7),
('البوابة الإلكترونية', 'GraduationCap', NULL, 0, NULL, 8),
('الموظفين', 'Briefcase', NULL, 0, NULL, 9),
('هيكلة التدريس', 'GraduationCap', NULL, 0, NULL, 10),
('بيانات المستخدمين', 'Users', NULL, 0, NULL, 11),
('الصلاحيات', 'ShieldCheck', NULL, 0, NULL, 12),
('إعدادات النظام', 'Settings', NULL, 0, NULL, 13);

-- ============================================================
-- 38. messages FK->users
-- ============================================================
INSERT INTO messages (sender_id, receiver_id, message_text, is_read, created_at) VALUES
(1, 2, 'السلام عليكم، هل تم تحديث الجدول الدراسي؟', true, '2025-10-01 08:00:00'),
(2, 1, 'وعليكم السلام، نعم تم التحديث', true, '2025-10-01 08:05:00'),
(1, 3, 'يرجى تحضير تقرير المواد لهذا الفصل', true, '2025-10-02 09:00:00'),
(3, 1, 'سيتم تحضير التقرير اليوم', false, '2025-10-02 09:30:00'),
(4, 1, 'تم إضافة درجات الطلاب', false, '2025-10-03 10:00:00');

-- ============================================================
-- 39. permissions
-- ============================================================
INSERT INTO permissions (perm_key, perm_name) VALUES
('view_dashboard', 'عرض لوحة التحكم'),
('manage_branches', 'إدارة الفروع'),
('manage_colleges', 'إدارة الكليات'),
('manage_students', 'إدارة الطلاب'),
('manage_exams', 'إدارة الاختبارات'),
('manage_requests', 'إدارة البلاغات'),
('manage_tasks', 'إدارة المهام'),
('manage_users', 'إدارة المستخدمين'),
('manage_roles', 'إدارة الأدوار'),
('manage_employees', 'إدارة الموظفين'),
('view_reports', 'عرض التقارير'),
('manage_settings', 'إدارة الإعدادات');

-- ============================================================
-- 40. role_page_permissions FK->roles
-- ============================================================
INSERT INTO role_page_permissions (role_id, page_key, can_view, can_add, can_edit, can_delete) VALUES
(2, 'dashboard', 't', 't', 't', 't'),
(2, 'branches', 't', 't', 't', 't'),
(2, 'colleges', 't', 't', 't', 't'),
(2, 'students', 't', 't', 't', 't'),
(2, 'exams', 't', 't', 't', 't'),
(2, 'requests', 't', 't', 't', 't'),
(2, 'tasks', 't', 't', 't', 't'),
(2, 'users', 't', 't', 't', 't'),
(2, 'roles', 't', 't', 't', 't'),
(2, 'employees', 't', 't', 't', 't'),
(2, 'reports', 't', 't', 't', 't'),
(2, 'settings', 't', 't', 't', 't'),
(3, 'dashboard', 't', 'f', 'f', 'f'),
(3, 'students', 't', 't', 't', 't'),
(3, 'exams', 't', 't', 't', 'f'),
(4, 'dashboard', 't', 'f', 'f', 'f'),
(4, 'exams', 't', 't', 't', 'f'),
(4, 'students', 't', 't', 't', 'f'),
(5, 'students', 't', 't', 't', 't'),
(6, 'students', 't', 't', 't', 'f'),
(7, 'requests', 't', 't', 't', 't'),
(7, 'tasks', 't', 't', 't', 't');

-- ============================================================
-- 41. user_page_access FK->users,sidebar_menu
-- ============================================================
INSERT INTO user_page_access (user_id, menu_id, can_view, can_add, can_edit, can_delete, can_transfer) VALUES
(1, 1, 1, 1, 1, 1, 1),
(1, 2, 1, 1, 1, 1, 1),
(1, 3, 1, 1, 1, 1, 1),
(2, 1, 1, 0, 0, 0, 0),
(3, 1, 1, 0, 0, 0, 0);

-- ============================================================
-- 42. user_group_access FK->users,groups
-- ============================================================
INSERT INTO user_group_access (user_id, group_id) VALUES
(7, 1),
(7, 5),
(8, 1),
(8, 5),
(3, 3);

-- ============================================================
-- 43. course_syllabi FK->study_subjects
-- ============================================================
INSERT INTO course_syllabi (study_subject_id, objectives, learning_outcomes,   teaching_methods, assessment_methods, "references", weekly_plan) VALUES
(1, 'تعريف الطلاب بمفاهيم البرمجة الأساسية وتطوير مهارات حل المشكلات باستخدام لغة JavaScript', 'أن يكون الطالب قادراً على: 1- كتابة برامج بسيطة 2- فهم المتغيرات والدوال 3- التعامل مع المصفوفات', 'محاضرات نظرية، تمارين عملية، مشاريع تطبيقية', 'امتحان تحريري 50%، تمارين 20%، مشروع 30%', '["JavaScript: The Good Parts", "Eloquent JavaScript"]', '[{"week":1,"topic":"مقدمة في البرمجة"},{"week":2,"topic":"المتغيرات والأنواع"},{"week":3,"topic":"الجمل الشرطية"},{"week":4,"topic":"الحلقات التكرارية"},{"week":5,"topic":"الدوال"},{"week":6,"topic":"المصفوفات"},{"week":7,"topic":"مراجعة وامتحان منتصف الفصل"},{"week":8,"topic":"الكائنات"},{"week":9,"topic":"معالجة الأخطاء"},{"week":10,"topic":"DOM Manipulation"},{"week":11,"topic":"الأحداث"},{"week":12,"topic":"مشروع تطبيقي"},{"week":13,"topic":"مراجعة نهائية"},{"week":14,"topic":"امتحان نهائي"}]'),
(2, 'تعليم الطلاب هياكل البيانات الأساسية وكيفية استخدامها في حل المشكلات البرمجية', 'فهم القوائم المرتبطة، المكدسات، الطوابير، الأشجار، والرسوم البيانية', 'محاضرات نظرية، تطبيقات عملية، تحليل خوارزميات', 'امتحان 60%، واجبات 20%، مشروع 20%', '["Introduction to Algorithms - CLRS", "Data Structures and Algorithms in JavaScript"]', '[{"week":1,"topic":"مراجعة البرمجة"},{"week":2,"topic":"المصفوفات والقوائم"},{"week":3,"topic":"القوائم المرتبطة"},{"week":4,"topic":"المكدسات"},{"week":5,"topic":"الطوابير"},{"week":6,"topic":"الأشجار"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"الرسوم البيانية"},{"week":9,"topic":"خوارزميات البحث"},{"week":10,"topic":"خوارزميات الترتيب"},{"week":11,"topic":"جداول التجزئة"},{"week":12,"topic":"تحليل التعقيد"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]');

-- ============================================================
-- 44. fee_types FK->colleges,programs,study_levels
-- ============================================================
INSERT INTO fee_types (fee_name, fee_name_en, fee_code, amount, is_recurring, recurring_period, college_id, program_id, study_level_id, status) VALUES
('الرسوم الدراسية - بكالوريوس', 'Tuition - Bachelor', 'TUIT-BSC', 500000, true, 'yearly', NULL, NULL, NULL, 'active'),
('رسوم التسجيل', 'Registration Fee', 'REG', 15000, false, 'one-time', NULL, NULL, NULL, 'active'),
('رسوم امتحان', 'Exam Fee', 'EXAM', 5000, true, 'semesterly', NULL, NULL, NULL, 'active'),
('رسوم معمل', 'Lab Fee', 'LAB', 10000, true, 'yearly', NULL, NULL, NULL, 'active'),
('رسوم مكتبة', 'Library Fee', 'LIB', 8000, true, 'yearly', NULL, NULL, NULL, 'active'),
('رسوم النشاط الطلابي', 'Student Activity Fee', 'ACT', 3000, true, 'semesterly', NULL, NULL, NULL, 'active'),
('رسوم مميزة - كلية الهندسة', 'Engineering College Fee', 'ENG-FEE', 600000, true, 'yearly', 1, NULL, NULL, 'active'),
('رسوم مميزة - كلية الطب', 'Medical College Fee', 'MED-FEE', 800000, true, 'yearly', 3, NULL, NULL, 'active');

-- ============================================================
-- 45. student_fees FK->students,fee_types,semesters
-- ============================================================
INSERT INTO student_fees (student_id, fee_type_id, amount, discount, discount_reason, due_date, status, paid_amount, remaining_amount, academic_semester_id, notes) VALUES
(1, 1, 500000, 50000, 'منحة تفوق', '2025-10-01', 'paid', 450000, 0, 1, 'تم السداد كاملاً'),
(2, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(3, 7, 600000, 0, NULL, '2025-10-01', 'partial', 300000, 300000, 1, 'بقي 300000'),
(4, 7, 600000, 60000, 'منحة نسبية', '2025-10-01', 'unpaid', 0, 540000, 1, 'لم يتم السداد بعد'),
(5, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(6, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(1, 2, 15000, 0, NULL, '2025-09-01', 'paid', 15000, 0, 1, 'رسوم تسجيل'),
(1, 5, 8000, 0, NULL, '2025-10-01', 'paid', 8000, 0, 1, NULL),
(2, 5, 8000, 0, NULL, '2025-10-01', 'paid', 8000, 0, 1, NULL),
(3, 5, 8000, 0, NULL, '2025-10-01', 'paid', 8000, 0, 1, NULL);

-- ============================================================
-- 46. fee_payments FK->student_fees,users
-- ============================================================
INSERT INTO fee_payments (student_fee_id, amount, payment_method, transaction_id, receipt_number, created_by) VALUES
(1, 200000, 'bank_transfer', 'TXN001', 'RCPT001', 6),
(1, 250000, 'cash', NULL, 'RCPT002', 6),
(2, 500000, 'bank_transfer', 'TXN002', 'RCPT003', 6),
(3, 300000, 'cash', NULL, 'RCPT004', 6),
(5, 500000, 'bank_transfer', 'TXN003', 'RCPT005', 6),
(6, 500000, 'cash', NULL, 'RCPT006', 6),
(7, 15000, 'cash', NULL, 'RCPT007', 6),
(8, 8000, 'cash', NULL, 'RCPT008', 6),
(9, 8000, 'bank_transfer', 'TXN004', 'RCPT009', 6),
(10, 8000, 'bank_transfer', 'TXN005', 'RCPT010', 6);

-- ============================================================
-- 47. scholarships FK->colleges,programs
-- ============================================================
INSERT INTO scholarships (scholarship_name, scholarship_type, discount_percentage, discount_amount, college_id, program_id, max_students, start_date, end_date, status) VALUES
('منحة التفوق العلمي', 'merit', 50, 0, NULL, NULL, 20, '2025-09-01', '2026-08-31', 'active'),
('منحة الطلاب المتميزين', 'partial', 25, 0, NULL, NULL, 50, '2025-09-01', '2026-08-31', 'active'),
('منحة كلية الهندسة', 'need_based', 30, 0, 1, NULL, 30, '2025-09-01', '2026-08-31', 'active'),
('منحة كلية الطب', 'full', 100, 0, 3, NULL, 10, '2025-09-01', '2026-08-31', 'active'),
('منحة الرياضة', 'partial', 15, 0, NULL, NULL, 25, '2025-09-01', '2026-08-31', 'active');

-- ============================================================
-- 48. attendance_sessions FK->lectures,subjects,employees
-- ============================================================
INSERT INTO attendance_sessions (lecture_id, study_subject_id, employee_id, session_date, start_time, end_time, session_type, status) VALUES
(1, 1, 3, '2025-10-05', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-10-05', '10:00', '12:00', 'lecture', 'completed'),
(3, 4, 2, '2025-10-06', '08:00', '10:00', 'lecture', 'completed'),
(1, 1, 3, '2025-10-12', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-10-12', '10:00', '12:00', 'lecture', 'completed'),
(4, 1, 5, '2025-10-07', '08:00', '10:00', 'lecture', 'completed');

-- ============================================================
-- 49. attendance_records FK->attendance_sessions,students
-- ============================================================
INSERT INTO attendance_records (attendance_session_id, student_id, status, check_in_time, late_minutes) VALUES
(1, 1, 'present', '2025-10-05 08:05:00', 5),
(1, 2, 'present', '2025-10-05 08:00:00', 0),
(1, 3, 'absent', NULL, 0),
(2, 1, 'present', '2025-10-05 10:00:00', 0),
(2, 2, 'late', '2025-10-05 10:10:00', 10),
(2, 3, 'present', '2025-10-05 10:02:00', 2),
(3, 7, 'present', '2025-10-06 08:00:00', 0),
(3, 3, 'present', '2025-10-06 08:01:00', 1),
(4, 1, 'present', '2025-10-12 07:55:00', 0),
(4, 2, 'present', '2025-10-12 08:00:00', 0),
(5, 1, 'late', '2025-10-12 10:15:00', 15),
(5, 2, 'absent', NULL, 0);

-- ============================================================
-- 50. library_books FK->colleges,departments
-- ============================================================
INSERT INTO library_books (title, title_en, author, publisher, isbn, edition, publication_year, category, book_type, total_copies, available_copies, shelf_location, description, status) VALUES
('مقدمة في الخوارزميات', 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', '9780262033848', 3, 2009, 'علوم حاسوب', 'printed', 10, 8, 'رف A-01', 'كتاب مرجعي في الخوارزميات', 'available'),
('هندسة البرمجيات', 'Software Engineering', 'Ian Sommerville', 'Pearson', '9780133943030', 10, 2015, 'هندسة', 'printed', 5, 4, 'رف B-02', NULL, 'available'),
('قواعد البيانات', 'Database Systems', 'Elmasri & Navathe', 'Pearson', '9780133970715', 7, 2016, 'علوم حاسوب', 'printed', 8, 6, 'رف A-03', NULL, 'available'),
('الشبكات الحاسوبية', 'Computer Networking', 'James Kurose', 'Pearson', '9780133594140', 7, 2016, 'شبكات', 'printed', 6, 5, 'رف B-01', NULL, 'available'),
('JavaScript: The Good Parts', 'JavaScript: The Good Parts', 'Douglas Crockford', 'OReilly', '9780596517748', 1, 2008, 'برمجة', 'electronic', 3, 3, 'رف E-01', NULL, 'available'),
('Clean Code', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', '9780132350884', 1, 2008, 'برمجة', 'printed', 4, 4, 'رف A-04', NULL, 'available'),
('التشريح البشري', 'Gray''s Anatomy', 'Henry Gray', 'Elsevier', '9780702052302', 41, 2015, 'طب', 'printed', 3, 2, 'رف C-01', NULL, 'available'),
('محاسبة مالية', 'Financial Accounting', 'IFRS Edition', 'Wiley', '9781118974245', 4, 2016, 'محاسبة', 'printed', 5, 5, 'رف D-01', NULL, 'available'),
('الذكاء الاصطناعي', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', 'Pearson', '9780134610993', 3, 2016, 'علوم حاسوب', 'printed', 7, 6, 'رف A-02', NULL, 'available');

-- ============================================================
-- 51. library_borrowings FK->library_books,students,employees
-- ============================================================
INSERT INTO library_borrowings (book_id, student_id, employee_id, borrowed_by_type, borrow_date, due_date, return_date, status, notes) VALUES
(1, 1, NULL, 'student', '2025-10-01', '2025-10-29', '2025-10-25', 'returned', NULL),
(1, 2, NULL, 'student', '2025-11-01', '2025-11-29', NULL, 'borrowed', NULL),
(3, 5, NULL, 'student', '2025-10-15', '2025-11-12', NULL, 'overdue', 'تأخر في الإرجاع'),
(2, NULL, 3, 'employee', '2025-10-10', '2025-11-07', NULL, 'borrowed', NULL),
(7, 11, NULL, 'student', '2025-10-20', '2025-11-17', NULL, 'borrowed', NULL),
(9, 8, NULL, 'student', '2025-10-05', '2025-11-02', '2025-10-30', 'returned', NULL);

-- ============================================================
-- 52. library_fines FK->library_borrowings
-- ============================================================
INSERT INTO library_fines (borrowing_id, fine_type, amount, days_overdue, is_paid, notes) VALUES
(3, 'overdue', 5000, 10, false, 'غرامة تأخير 10 أيام'),
(3, 'damage', 3000, 0, false, 'تمزيق غلاف الكتاب');

-- ============================================================
-- 53. library_reservations FK->library_books,students,employees
-- ============================================================
INSERT INTO library_reservations (book_id, student_id, employee_id, reserved_by_type, reservation_date, expiry_date, status) VALUES
(1, 3, NULL, 'student', '2025-11-20', '2025-12-04', 'active'),
(3, 1, NULL, 'student', '2025-11-15', '2025-11-29', 'active'),
(5, NULL, 5, 'employee', '2025-11-10', '2025-11-24', 'fulfilled');

-- ============================================================
-- 54. document_categories
-- ============================================================
INSERT INTO document_categories (category_name, parent_id, sort_order) VALUES
('المستندات الرسمية', NULL, 1),
('المستندات الأكاديمية', NULL, 2),
('المستندات المالية', NULL, 3),
('عقود', 1, 1),
('شهادات', 2, 1),
('سجلات طلاب', 2, 2),
('فواتير', 3, 1),
('تقارير مالية', 3, 2),
('مستندات موظفين', 1, 2),
('لوائح وأنظمة', 1, 3);

-- ============================================================
-- 55. documents FK->document_categories,users
-- ============================================================
INSERT INTO documents (title, category_id, document_type, file_path, file_size, entity_type, entity_id, tags, is_confidential, version, uploaded_by) VALUES
('عقد توظيف - أحمد محمد', 4, 'pdf', '/uploads/contracts/emp001.pdf', 250000, 'employee', 1, 'عقد,توظيف', false, 1, 1),
('السجل الأكاديمي - أحمد خالد', 6, 'pdf', '/uploads/records/2024001.pdf', 180000, 'student', 1, 'سجل,أكاديمي', true, 1, 5),
('شهادة بكالوريوس - سارة محمد', 5, 'pdf', '/uploads/certificates/sara.pdf', 350000, 'student', 2, 'شهادة', false, 1, 5),
('فاتورة الرسوم - الفصل الأول', 7, 'excel', '/uploads/invoices/fees_f1.xlsx', 120000, 'general', NULL, 'فاتورة,رسوم', false, 1, 6),
('اللائحة الداخلية للجامعة', 10, 'pdf', '/uploads/policies/internal_regs.pdf', 500000, 'general', NULL, 'لائحة,قوانين', false, 2, 1),
('تقرير مالي ربع سنوي', 8, 'excel', '/uploads/reports/q1_report.xlsx', 280000, 'general', NULL, 'تقرير,مالي', true, 1, 6);

-- ============================================================
-- 56. notification_templates
-- ============================================================
INSERT INTO notification_templates (template_name, template_key, subject, body, channels, variables) VALUES
('تأكيد تسجيل الطالب', 'student_registration', 'تأكيد تسجيل الطالب {student_name}', 'عزيزي الطالب {student_name}، تم تسجيلك بنجاح في الفصل الدراسي {semester_name}. رقمك الجامعي: {student_number}', 'email,sms', '["student_name","semester_name","student_number"]'),
('إشعار بموعد امتحان', 'exam_reminder', 'تذكير بموعد امتحان {exam_name}', 'عزيزي الطالب، يرجى العلم أن امتحان {exam_name} سيكون بتاريخ {exam_date} الساعة {exam_time}', 'email,sms,push', '["exam_name","exam_date","exam_time"]'),
('إشعار باستحقاق الرسوم', 'fee_due', 'إشعار باستحقاق الرسوم الدراسية', 'عزيزي الطالب {student_name}، يستحق عليك مبلغ {amount} ريال كرسوم دراسية. تاريخ الاستحقاق: {due_date}', 'email,sms', '["student_name","amount","due_date"]'),
('إشعار بنتيجة الامتحان', 'exam_result', 'نتيجة امتحان {exam_name}', 'عزيزي الطالب {student_name}، نتيجة امتحان {exam_name}: {grade}', 'email,push', '["student_name","exam_name","grade"]'),
('إشعار غرامة مكتبة', 'library_fine', 'إشعار بغرامة مكتبة', 'عزيزي الطالب {student_name}، توجد عليك غرامة مكتبة بقيمة {amount} ريال عن كتاب {book_title}', 'email,sms', '["student_name","amount","book_title"]');

-- ============================================================
-- 57. notifications FK->notification_templates (simplified - no real send)
-- ============================================================
INSERT INTO notifications (recipient_type, recipient_id, title, body, channel, status, created_at) VALUES
('student', 1, 'تأكيد التسجيل', 'تم تسجيلك بنجاح في الفصل الأول 2025-2026', 'email', 'sent', '2025-09-01 08:00:00'),
('student', 2, 'تأكيد التسجيل', 'تم تسجيلك بنجاح في الفصل الأول 2025-2026', 'email', 'sent', '2025-09-01 08:01:00'),
('student', 1, 'تذكير بموعد امتحان', 'موعد امتحان البرمجة: 2025-11-01 الساعة 10:00', 'push', 'sent', '2025-10-30 08:00:00'),
('student', 3, 'إشعار رسوم', 'لديك رسوم مستحقة بقيمة 300000 ريال', 'sms', 'sent', '2025-10-15 09:00:00');

-- ============================================================
-- 58. academic_records FK->students,subjects,semesters,employees,groups
-- ============================================================
INSERT INTO academic_records (student_id, study_subject_id, academic_semester_id, employee_id, study_group_id, grade_numeric, grade_letter, grade_points, is_pass, status, attendance_percentage, notes) VALUES
(1, 1, 1, 3, 4, 85, 'B+', 3.5, true, 'completed', 95, NULL),
(1, 6, 1, 1, 1, 78, 'C+', 2.5, true, 'completed', 88, NULL),
(1, 7, 1, 1, 1, 92, 'A', 4.0, true, 'completed', 100, 'متفوق'),
(2, 1, 1, 3, 4, 95, 'A', 4.0, true, 'completed', 98, NULL),
(2, 6, 1, 1, 1, 88, 'B+', 3.5, true, 'completed', 92, NULL),
(2, 7, 1, 1, 1, 82, 'B', 3.0, true, 'completed', 90, NULL),
(3, 6, 1, 1, 1, 75, 'C', 2.0, true, 'completed', 85, NULL),
(3, 7, 1, 1, 1, 68, 'D+', 1.5, true, 'completed', 80, NULL),
(3, 4, 1, 2, 1, 88, 'B+', 3.5, true, 'completed', 95, NULL),
(7, 4, 1, 2, 1, 92, 'A', 4.0, true, 'completed', 97, NULL),
(7, 6, 1, 1, 1, 80, 'B', 3.0, true, 'completed', 90, NULL),
(5, 1, 1, 3, 4, 88, 'B+', 3.5, true, 'completed', 93, NULL),
(5, 2, 1, 3, 4, 72, 'C', 2.0, true, 'completed', 85, NULL);

-- ============================================================
-- 59. academic_warnings FK->students,semesters,users
-- ============================================================
INSERT INTO academic_warnings (student_id, warning_type, warning_level, reason, gpa_at_warning, semester_id, issued_by, status, created_at) VALUES
(3, 'low_gpa', 1, 'انخفاض المعدل التراكمي إلى 1.5', 1.50, 1, 1, 'active', '2025-12-15 10:00:00'),
(8, 'attendance', 1, 'نسبة الغياب تجاوزت 25%', NULL, 1, 5, 'resolved', '2025-11-01 09:00:00');

-- ============================================================
-- 60. student_enrollments FK->students,semesters,levels,groups
-- ============================================================
INSERT INTO student_enrollments (student_id, academic_semester_id, enrollment_type, enrollment_date, study_level_id, study_group_id, total_hours, max_hours, status) VALUES
(1, 1, 'new', '2025-09-01', 1, 4, 15, 20, 'active'),
(2, 1, 'new', '2025-09-01', 1, 4, 15, 20, 'active'),
(3, 1, 'new', '2025-09-01', 1, 1, 15, 20, 'active'),
(4, 1, 'new', '2025-09-01', 1, 2, 15, 20, 'active'),
(5, 1, 'regular', '2025-09-01', 2, 4, 15, 20, 'active'),
(6, 1, 'regular', '2025-09-01', 2, 5, 15, 21, 'active'),
(7, 1, 'regular', '2025-09-01', 3, 1, 15, 18, 'active'),
(8, 1, 'regular', '2025-09-01', 3, 5, 15, 18, 'active'),
(9, 1, 'regular', '2025-09-01', 4, 4, 15, 18, 'active'),
(10, 1, 'regular', '2025-09-01', 3, 3, 15, 18, 'active'),
(11, 1, 'new', '2025-09-01', 1, 6, 0, 24, 'active'),
(12, 1, 'new', '2025-09-01', 1, 6, 0, 24, 'active'),
(13, 1, 'new', '2025-09-01', 1, NULL, 0, 18, 'active'),
(14, 1, 'regular', '2025-09-01', 3, NULL, 15, 18, 'active');

-- ============================================================
-- 61. exam_schedules FK->exams,rooms,employees
-- ============================================================
INSERT INTO exam_schedules (exam_id, room_id, exam_date, start_time, end_time, student_count, proctor_id, proctor2_id, status) VALUES
(1, 3, '2025-11-01', '10:00', '11:00', 30, 3, 7, 'completed'),
(3, 3, '2025-11-05', '10:00', '11:00', 25, 3, NULL, 'completed'),
(4, 4, '2025-11-10', '10:00', '11:00', 20, 1, 4, 'scheduled'),
(5, 1, '2025-11-03', '10:00', '11:00', 15, 2, NULL, 'completed'),
(7, 4, '2025-11-15', '14:00', '15:30', 30, 5, 3, 'scheduled');

-- ============================================================
-- 62. exam_seating FK->exam_schedules,students
-- ============================================================
INSERT INTO exam_seating (exam_schedule_id, student_id, seat_number, row_number, column_number, attendance_status, check_in_time) VALUES
(1, 1, 'A-01', 1, 1, 'present', '2025-11-01 09:55:00'),
(1, 2, 'A-02', 1, 2, 'present', '2025-11-01 09:58:00'),
(1, 5, 'A-03', 1, 3, 'present', '2025-11-01 10:00:00'),
(2, 1, 'B-01', 1, 1, 'present', '2025-11-05 09:55:00'),
(2, 5, 'B-02', 1, 2, 'late', '2025-11-05 10:10:00'),
(3, 5, 'C-01', 1, 1, 'absent', NULL),
(3, 8, 'C-02', 1, 2, 'present', '2025-11-10 09:50:00');

-- ============================================================
-- 63. exam_grades FK->exams,students,employees
-- ============================================================
INSERT INTO exam_grades (exam_id, student_id, score, percentage, grade_letter, status, graded_by, graded_at, notes) VALUES
(1, 1, 85, 85, 'B+', 'published', 3, '2025-11-05 14:00:00', NULL),
(1, 2, 92, 92, 'A', 'published', 3, '2025-11-05 14:00:00', NULL),
(1, 5, 78, 78, 'C+', 'published', 3, '2025-11-05 14:00:00', NULL),
(2, 1, 75, 75, 'C', 'published', 3, '2025-11-06 10:00:00', NULL),
(2, 5, 60, 60, 'D', 'published', 3, '2025-11-06 10:00:00', 'ضعيف'),
(3, 5, 88, 88, 'B+', 'published', 1, '2025-11-12 12:00:00', NULL),
(3, 8, 82, 82, 'B', 'published', 1, '2025-11-12 12:00:00', NULL);

-- ============================================================
-- 64. contractors FK->colleges,departments,employees
-- ============================================================
INSERT INTO contractors (full_name, full_name_en, identity_number, phone, email, contract_type, contract_number, start_date, end_date, contract_duration_months, salary_amount, allowances, total_amount, payment_frequency, bank_account, bank_name, college_id, department_id, supervisor_id, status, notify_before_expiry) VALUES
('مهندس أحمد محسن', 'Ahmed Mohsen', '1234567890', '771234500', 'ahmed.mohsen@contractor.com', 'full_time', 'CTR-2025-001', '2025-09-01', '2026-08-31', 12, 350000, 50000, 400000, 'monthly', 'SA0012345678', 'البنك الأهلي', 1, 1, 1, 'active', 30),
('د. وليد الحضرمي', 'Waleed Al-Hadhrami', '2234567890', '772345600', 'waleed@contractor.com', 'part_time', 'CTR-2025-002', '2025-09-01', '2026-01-15', 4, 200000, 0, 200000, 'monthly', 'SA0098765432', 'بنك التسليف', 2, 4, 3, 'active', 15),
('م. سامي عبدالله', 'Sami Abdullah', '3234567890', '773456700', 'sami@contractor.com', 'consultancy', 'CTR-2025-003', '2025-10-01', '2026-03-31', 6, 400000, 100000, 500000, 'monthly', 'SA0055555555', 'البنك اليمني', 1, 2, 2, 'active', 30);

-- ============================================================
-- 65. contractor_documents FK->contractors
-- ============================================================
INSERT INTO contractor_documents (contractor_id, document_type, document_name, file_path, issue_date, expiry_date, is_verified, notes) VALUES
(1, 'contract', 'عقد توظيف', '/uploads/contractors/ctr001_contract.pdf', '2025-08-25', '2026-08-31', true, 'العقد الأصلي'),
(1, 'passport', 'صورة جواز سفر', '/uploads/contractors/ctr001_passport.pdf', '2023-01-01', '2028-01-01', true, NULL),
(2, 'contract', 'عقد تدريس', '/uploads/contractors/ctr002_contract.pdf', '2025-08-20', '2026-01-15', true, 'عقد محاضر خارجي'),
(2, 'certificate', 'شهادة دكتوراه', '/uploads/contractors/ctr002_phd.pdf', '2018-06-15', NULL, true, 'شهادة معتمدة'),
(3, 'contract', 'عقد استشارات', '/uploads/contractors/ctr003_contract.pdf', '2025-09-25', '2026-03-31', true, NULL);

-- ============================================================
-- 66. time_slots FK->colleges
-- ============================================================
INSERT INTO time_slots (slot_name, day_of_week, start_time, end_time, slot_type, college_id, is_active) VALUES
('الفترة الأولى', 0, '08:00', '09:30', 'regular', NULL, true),
('الفترة الثانية', 0, '09:45', '11:15', 'regular', NULL, true),
('الفترة الثالثة', 0, '11:30', '13:00', 'regular', NULL, true),
('الفترة الرابعة', 0, '13:15', '14:45', 'regular', NULL, true),
('استراحة', 0, '14:45', '15:15', 'break', NULL, true),
('الفترة الخامسة', 0, '15:15', '16:45', 'regular', NULL, true),
('الفترة الأولى', 1, '08:00', '09:30', 'regular', NULL, true),
('الفترة الثانية', 1, '09:45', '11:15', 'regular', NULL, true),
('الفترة الثالثة', 1, '11:30', '13:00', 'regular', NULL, true),
('الفترة الرابعة', 1, '13:15', '14:45', 'regular', NULL, true),
('استراحة', 1, '14:45', '15:15', 'break', NULL, true),
('الفترة الخامسة', 1, '15:15', '16:45', 'regular', NULL, true),
('الفترة الأولى', 2, '08:00', '09:30', 'regular', NULL, true),
('الفترة الثانية', 2, '09:45', '11:15', 'regular', NULL, true),
('الفترة الثالثة', 2, '11:30', '13:00', 'regular', NULL, true),
('الفترة الرابعة', 2, '13:15', '14:45', 'regular', NULL, true),
('استراحة', 2, '14:45', '15:15', 'break', NULL, true),
('الفترة الخامسة', 2, '15:15', '16:45', 'regular', NULL, true),
('الفترة الأولى', 3, '08:00', '09:30', 'regular', NULL, true),
('الفترة الثانية', 3, '09:45', '11:15', 'regular', NULL, true),
('الفترة الثالثة', 3, '11:30', '13:00', 'regular', NULL, true),
('الفترة الرابعة', 3, '13:15', '14:45', 'regular', NULL, true),
('استراحة', 3, '14:45', '15:15', 'break', NULL, true),
('الفترة الخامسة', 3, '15:15', '16:45', 'regular', NULL, true),
('الفترة الأولى', 4, '08:00', '09:30', 'regular', NULL, true),
('الفترة الثانية', 4, '09:45', '11:15', 'regular', NULL, true),
('الفترة الثالثة', 4, '11:30', '13:00', 'regular', NULL, true),
('الفترة الرابعة', 4, '13:15', '14:45', 'regular', NULL, true),
('استراحة', 4, '14:45', '15:15', 'break', NULL, true),
('الفترة الخامسة', 4, '15:15', '16:45', 'regular', NULL, true);

-- ============================================================
-- 67. academic_calendar FK->academic_semesters
-- ============================================================
INSERT INTO academic_calendar (academic_semester_id, event_date, event_type, event_title, event_title_en, description, is_holiday) VALUES
(1, '2025-09-01', 'classes_start', 'بداية الدراسة', 'Classes Start', 'بداية الفصل الدراسي الأول', false),
(1, '2025-09-15', 'registration_end', 'نهاية التسجيل', 'Registration End', 'آخر موعد للتسجيل', false),
(1, '2025-11-01', 'exams_start', 'امتحانات منتصف الفصل', 'Midterm Exams', 'بداية امتحانات منتصف الفصل', false),
(1, '2025-11-07', 'exams_end', 'نهاية امتحانات منتصف الفصل', 'Midterm Exams End', 'نهاية امتحانات منتصف الفصل', false),
(1, '2025-11-26', 'holiday', 'عيد الاستقلال', 'Independence Day', 'إجازة عيد الاستقلال', true),
(1, '2025-12-31', 'holiday', 'رأس السنة الميلادية', 'New Year', 'إجازة رأس السنة', true),
(1, '2026-01-05', 'exams_start', 'الامتحانات النهائية', 'Final Exams', 'بداية الامتحانات النهائية', false),
(1, '2026-01-15', 'exams_end', 'نهاية الامتحانات', 'Final Exams End', 'نهاية الامتحانات النهائية', false),
(1, '2026-01-15', 'classes_end', 'نهاية الدراسة', 'Classes End', 'نهاية الفصل الدراسي الأول', false),
(2, '2026-02-01', 'classes_start', 'بداية الفصل الثاني', 'Spring Semester Start', 'بداية الفصل الدراسي الثاني', false);

-- ============================================================
-- 68. university_config (already has INSERT in migration for defaults)
-- ============================================================
INSERT INTO university_config (config_key, config_value, config_group, description) VALUES
('university_name', 'جامعة العلوم والتكنولوجيا', 'general', 'اسم الجامعة'),
('university_name_en', 'University of Science and Technology', 'general', 'اسم الجامعة بالإنجليزية'),
('university_vision', 'الريادة في التعليم والبحث العلمي', 'general', 'رؤية الجامعة'),
('university_mission', 'إعداد كوادر مؤهلة علمياً ومهنياً', 'general', 'رسالة الجامعة'),
('contact_email', 'info@ust.edu.ye', 'contact', 'البريد الإلكتروني'),
('contact_phone', '+967123456789', 'contact', 'رقم الهاتف'),
('contact_address', 'صنعاء - شارع الستين', 'contact', 'العنوان'),
('exam_pass_percentage', '50', 'academic', 'نسبة النجاح'),
('attendance_method', 'qr', 'attendance', 'طريقة تسجيل الحضور'),
('grading_system', 'letter', 'academic', 'نظام الدرجات'),
('social_facebook', 'https://facebook.com/ust', 'social', 'فيسبوك'),
('social_twitter', 'https://twitter.com/ust', 'social', 'تويتر'),
('social_linkedin', 'https://linkedin.com/company/ust', 'social', 'لينكد إن')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- 69. university_news FK->users
-- ============================================================
INSERT INTO university_news (title, title_en, slug, summary, content, category, is_published, published_at, created_by) VALUES
('افتتاح معمل الحاسوب الجديد', 'New Computer Lab Opening', 'new-computer-lab', 'تم افتتاح معمل حاسوب مجهز بأحدث التقنيات', 'تعلن جامعة العلوم والتكنولوجيا عن افتتاح معمل حاسوب جديد في كلية علوم الحاسوب، مجهز بأحدث أجهزة الحاسوب وبرامج التصميم والبرمجة، لخدمة الطلاب وتطوير مهاراتهم العملية.', 'news', true, '2025-10-01 09:00:00', 1),
('ندوة حول الذكاء الاصطناعي', 'AI Workshop', 'ai-workshop', 'ندوة تعريفية بتقنيات الذكاء الاصطناعي', 'نظمت كلية علوم الحاسوب ندوة حول تطبيقات الذكاء الاصطناعي في التعليم، حضرها عدد من الأكاديميين والطلاب.', 'event', true, '2025-10-15 10:00:00', 1),
('نتائج الامتحانات', 'Exam Results', 'exam-results-oct', 'نتائج امتحانات منتصف الفصل متاحة', 'تعلن عمادة شؤون الطلاب عن availability نتائج امتحانات منتصف الفصل الأول 2025-2026 عبر البوابة الإلكترونية.', 'announcement', true, '2025-11-10 08:00:00', 5),
('حصول الجامعة على مركز متقدم', 'University Ranking Achievement', 'ranking-achievement', 'الجامعة تحصل على مركز متقدم في التصنيف', 'حصلت جامعة العلوم والتكنولوجيا على مركز متقدم في التصنيف المحلي للجامعات، وذلك بفضل الجهود المبذولة في تطوير العملية التعليمية والبحثية.', 'achievement', true, '2025-12-01 11:00:00', 1);

-- ============================================================
-- 70. university_events FK->users
-- ============================================================
INSERT INTO university_events (title, title_en, slug, description, event_date, event_time, location, category, is_published, created_by) VALUES
('المؤتمر السنوي للهندسة', 'Annual Engineering Conference', 'eng-conf-2026', 'المؤتمر السنوي لكلية الهندسة يناقش أحدث التطورات في المجالات الهندسية', '2026-03-15', '09:00', 'مدرج كلية الهندسة', 'conference', true, 1),
('ورشة عمل: البرمجة بلغة Python', 'Python Workshop', 'python-ws', 'ورشة عمل مكثفة في البرمجة بلغة Python للمبتدئين', '2025-12-20', '10:00', 'معمل الحاسوب B202', 'workshop', true, 3),
('اليوم الرياضي السنوي', 'Annual Sports Day', 'sports-day-2026', 'الفعاليات الرياضية السنوية لطلاب الجامعة', '2026-04-01', '08:00', 'الملعب الرياضي', 'sport', true, 5),
('معرض التوظيف', 'Job Fair', 'job-fair-2026', 'معرض التوظيف السنوي بمشاركة كبرى الشركات', '2026-05-10', '10:00', 'قاعة المؤتمرات', 'cultural', true, 1);

-- ============================================================
-- 71. job_openings FK->users
-- ============================================================
INSERT INTO job_openings (title, title_en, department, job_type, description, requirements, salary_range, application_deadline, is_published, created_by) VALUES
('أستاذ مساعد - علوم حاسوب', 'Assistant Professor - CS', 'قسم علوم الحاسوب', 'full_time', 'التدريس والإشراف على أبحاث الطلاب في مجالات علوم الحاسوب', 'دكتوراه في علوم الحاسوب أو مجال ذي صلة، خبرة تدريسية لا تقل عن سنتين', '500,000 - 700,000', '2026-03-01', true, 1),
('فني مختبر حاسوب', 'Computer Lab Technician', 'كلية علوم الحاسوب', 'full_time', 'صيانة أجهزة الحاسوب والشبكات في المعامل', 'بكالوريوس تقنية معلومات أو حاسوب، خبرة في صيانة الحاسوب', '200,000 - 300,000', '2026-02-15', true, 1),
('محاضر لغة إنجليزية', 'English Lecturer', 'كلية العلوم الإدارية', 'part_time', 'تدريس اللغة الإنجليزية للطلاب', 'ماجستير في اللغة الإنجليزية أو تدريسها', '150,000 - 200,000', '2026-01-31', true, 1),
('أمين مكتبة', 'Librarian', 'المكتبة المركزية', 'full_time', 'إدارة المكتبة وتنظيم الفهارس وخدمة المستفيدين', 'بكالوريوس مكتبات ومعلومات، خبرة لا تقل عن سنة', '180,000 - 250,000', '2026-03-15', false, 1);

-- ============================================================
-- 72. contact_messages
-- ============================================================
INSERT INTO contact_messages (name, email, phone, subject, message, is_read, created_at) VALUES
('أحمد محمد', 'ahmed@example.com', '771234567', 'استفسار عن القبول', 'السلام عليكم، أود الاستفسار عن شروط القبول في كلية الهندسة للعام القادم.', true, '2025-10-05 14:30:00'),
('سامية عبدالله', 'samia@example.com', '772345678', 'شكوى', 'كان هناك تأخير في معاملة الطالب رقم 2024001', true, '2025-10-20 10:00:00'),
('خالد عمر', 'khalid@example.com', '773456789', 'طلب معلومات', 'أرجو تزويدي بمعلومات عن البرامج الدراسية المتاحة.', false, '2025-11-01 09:15:00');

-- ============================================================
-- 73. student_semester_gpa FK->students,semesters (calculated)
-- ============================================================
INSERT INTO student_semester_gpa (student_id, academic_semester_id, semester_hours, semester_gpa, semester_points, cumulative_hours, cumulative_gpa, cumulative_points) VALUES
(1, 1, 8, 3.375, 27.0, 8, 3.375, 27.0),
(2, 1, 8, 3.750, 30.0, 8, 3.750, 30.0),
(3, 1, 8, 2.500, 20.0, 8, 2.500, 20.0),
(5, 1, 6, 2.750, 16.5, 30, 3.200, 96.0),
(7, 1, 6, 3.500, 21.0, 45, 3.000, 135.0);

-- ============================================================
-- 74. tickets
-- ============================================================
INSERT INTO tickets (title, description, created_by, assigned_to, status) VALUES
('مشكلة في النظام المالي', 'النظام المالي لا يستجيب', 1, 7, 'open'),
('طلب تحديث برنامج', 'تحديث برنامج إدارة الامتحانات', 2, 7, 'closed');

-- ============================================================
-- 75. chatbot_training
-- ============================================================
INSERT INTO chatbot_training (question, intent, sql_query, expected_response) VALUES
('كم عدد الطلاب المسجلين؟', 'student_count', 'SELECT COUNT(*) FROM students', 'عدد الطلاب المسجلين هو'),
('كم عدد الموظفين؟', 'employee_count', 'SELECT COUNT(*) FROM employees', 'عدد الموظفين هو'),
('عرض الطلاب النشطين', 'active_students', 'SELECT full_name, student_number FROM students WHERE status = ''active''', 'الطلاب النشطون:');

-- ============================================================
-- 76. question_templates
-- ============================================================
INSERT INTO question_templates (template_text, intent, category) VALUES
('كم عدد {entity}؟', 'count', 'إحصائيات'),
('عرض {entity}', 'list', 'عرض بيانات'),
('من هو {entity}؟', 'detail', 'تفاصيل');

-- ============================================================
-- 77. training_questions
-- ============================================================
INSERT INTO training_questions (question, intent, category) VALUES
('كم عدد الطلاب؟', 'student_count', 'إحصائيات'),
('كم عدد الكليات؟', 'college_count', 'إحصائيات'),
('عرض الطلاب', 'list_students', 'طلاب'),
('من هو المدير؟', 'admin_info', 'إدارة');

-- ============================================================
-- 78. user_branches FK->users,branch
-- ============================================================
INSERT INTO user_branches (user_id, branch_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1);

-- ============================================================
-- 79. system_logs
-- ============================================================
INSERT INTO system_logs (user_name, action, details, ip_address, created_at) VALUES
('أحمد محمد', 'تسجيل دخول', 'تم تسجيل الدخول إلى النظام', '192.168.1.100', '2025-10-01 08:00:00'),
('أحمد محمد', 'إضافة طالب', 'تم إضافة الطالب أحمد خالد', '192.168.1.100', '2025-10-01 09:15:00'),
('خالد عمر', 'تعديل بلاغ', 'تم تعديل البلاغ رقم 1', '192.168.1.101', '2025-10-05 10:30:00'),
('نورة عبدالله', 'تسجيل دفعة', 'تم تسجيل دفعة رسوم للطالب 2 بقيمة 500000', '192.168.1.102', '2025-10-10 11:00:00');

-- ============================================================
-- 80. student_scholarships FK->students,scholarships,semesters
-- ============================================================
INSERT INTO student_scholarships (student_id, scholarship_id, academic_semester_id, status, granted_date, notes) VALUES
(1, 1, 1, 'active', '2025-09-15', 'منحة تفوق'),
(4, 3, 1, 'active', '2025-09-20', 'منحة نسبية 10%');

COMMIT;
