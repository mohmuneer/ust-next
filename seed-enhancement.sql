-- ============================================================
-- ENHANCED SEED DATA - Comprehensive Demo Data
-- Adds realistic data to ALL screens for a university demo
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADDITIONAL STUDENTS (IDs 15-35)
-- ============================================================
INSERT INTO students (student_number, full_name, email, phone, college_id, department_id, study_level_id, study_group_id, academic_semester_id, status, total_earned_hours, total_gpa_points, cumulative_gpa, academic_status, enrollment_date, expected_graduation_date, nationality, birth_date, gender, address) VALUES
('2024005', 'وليد أحمد باوزير', 'waleed.ali@stu.ust.edu.ye', '775123456', 1, 1, 2, 1, 1, 'active', 30, 99.0, 3.30, 'active', '2024-09-01', '2028-06-15', 'يمني', '2004-03-22', 'ذكر', 'صنعاء'),
('2024006', 'هدى سعيد المقطري', 'huda.saeed@stu.ust.edu.ye', '776234567', 1, 2, 2, 3, 1, 'active', 30, 105.0, 3.50, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-07-10', 'أنثى', 'عدن'),
('2024007', 'إبراهيم محمد الحمادي', 'ibrahim.mohammed@stu.ust.edu.ye', '777345678', 1, 1, 1, 1, 1, 'active', 15, 42.0, 2.80, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-11-05', 'ذكر', 'تعز'),
('2024008', 'آمنة خالد البكري', 'amna.khaled@stu.ust.edu.ye', '778456789', 1, 2, 3, 3, 1, 'active', 45, 126.0, 2.80, 'active', '2023-09-01', '2027-06-15', 'يمنية', '2003-01-30', 'أنثى', 'صنعاء'),
('2024009', 'سعيد عبدالله الراشد', 'saeed.abdullah@stu.ust.edu.ye', '779567890', 1, 1, 2, 2, 1, 'active', 30, 84.0, 2.80, 'active', '2024-09-01', '2028-06-15', 'يمني', '2004-05-18', 'ذكر', 'ذمار'),
('2024010', 'رنيا عادل الشرفي', 'rania.adel@stu.ust.edu.ye', '770678901', 2, 4, 2, 4, 1, 'active', 30, 111.0, 3.70, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-09-25', 'أنثى', 'صنعاء'),
('2024011', 'ماجد فتحي الهاشمي', 'majid.fathi@stu.ust.edu.ye', '771789012', 2, 4, 1, 5, 1, 'active', 15, 37.5, 2.50, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-08-14', 'ذكر', 'عدن'),
('2024012', 'سلمى ناصر العولقي', 'sulma.nasser@stu.ust.edu.ye', '772890123', 2, 5, 2, 5, 1, 'active', 30, 90.0, 3.00, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-12-03', 'أنثى', 'صنعاء'),
('2023013', 'هيثم علي الديني', 'haitham.ali@stu.ust.edu.ye', '773901234', 2, 4, 3, 4, 1, 'active', 45, 117.0, 2.60, 'probation', '2023-09-01', '2027-06-15', 'يمني', '2003-04-17', 'ذكر', 'إب'),
('2023014', 'ياسمين حسين الموسوي', 'yasmin.hussein@stu.ust.edu.ye', '774012345', 2, 5, 3, 5, 1, 'active', 45, 139.5, 3.10, 'active', '2023-09-01', '2027-06-15', 'يمنية', '2003-08-22', 'أنثى', 'صنعاء'),
('2023015', 'عمر سالم القاضي', 'omar.saleh@stu.ust.edu.ye', '775123457', 1, 1, 3, 1, 1, 'active', 45, 108.0, 2.40, 'active', '2023-09-01', '2027-06-15', 'يمني', '2003-02-11', 'ذكر', 'تعز'),
('2022016', 'ناديا أحمد العمري', 'nadia.ahmed@stu.ust.edu.ye', '776234568', 2, 4, 4, 4, 1, 'active', 75, 277.5, 3.70, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2002-06-30', 'أنثى', 'صنعاء'),
('2022017', 'فؤاد عبدالرحمن الجوفي', 'fuad.abdo@stu.ust.edu.ye', '777345679', 1, 3, 4, 3, 1, 'active', 75, 232.5, 3.10, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-11-08', 'ذكر', 'عدن'),
('2022018', 'مها خالد السعدي', 'maha.khaled@stu.ust.edu.ye', '778456790', 1, 2, 4, 3, 1, 'graduated', 120, 420.0, 3.50, 'graduated', '2022-09-01', '2026-06-15', 'يمنية', '2002-03-25', 'أنثى', 'صنعاء'),
('2024019', 'أحمد ناصر الحبيشي', 'ahmed.nasser@stu.ust.edu.ye', '779567891', 1, 1, 1, 2, 1, 'active', 15, 33.0, 2.20, 'probation', '2025-09-01', '2029-06-15', 'يمني', '2005-07-19', 'ذكر', 'حجة'),
('2024020', 'صفاء يوسف المقطري', 'safaa.yousuf@stu.ust.edu.ye', '770678902', 4, 9, 1, NULL, 1, 'active', 15, 48.0, 3.20, 'active', '2025-09-01', '2029-06-15', 'يمنية', '2005-01-05', 'أنثى', 'صنعاء'),
('2024021', 'عبدالله محمد باوزير', 'abdullah.m@stu.ust.edu.ye', '771789013', 4, 10, 2, NULL, 1, 'active', 30, 87.0, 2.90, 'active', '2024-09-01', '2028-06-15', 'يمني', '2004-10-12', 'ذكر', 'إب'),
('2024022', 'هند عبدالعزيز الراشد', 'hind.abdulaziz@stu.ust.edu.ye', '772890124', 4, 11, 2, NULL, 1, 'active', 30, 96.0, 3.20, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-04-28', 'أنثى', 'صنعاء'),
('2025004', 'محمد صالح الداعري', 'mohamed.saleh@stu.ust.edu.ye', '773901235', 3, 7, 1, 6, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2031-06-15', 'يمني', '2006-02-14', 'ذكر', 'تعز'),
('2025005', 'أروى حسين المقطري', 'arwa.hussein@stu.ust.edu.ye', '774012346', 3, 8, 1, 7, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2031-06-15', 'يمنية', '2006-09-07', 'أنثى', 'صنعاء'),
('2025006', 'طارق عادل الهرسي', 'tariq.adel@stu.ust.edu.ye', '775123458', 4, 9, 1, NULL, 1, 'active', 0, 0, 0, 'active', '2025-09-01', '2029-06-15', 'يمني', '2005-12-20', 'ذكر', 'صنعاء'),
('2023016', 'سمية علي الحارثي', 'sumaya.ali@stu.ust.edu.ye', '776234569', 1, 1, 3, 2, 1, 'suspended', 45, 90.0, 2.00, 'suspended', '2023-09-01', '2027-06-15', 'يمنية', '2003-05-03', 'أنثى', 'عدن'),
('2022019', 'يوسف محمد المعمري', 'yousuf.mohammed@stu.ust.edu.ye', '777345680', 2, 4, 4, 5, 1, 'active', 75, 255.0, 3.40, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-07-16', 'ذكر', 'صنعاء'),
('2024023', 'منى سعيد المحجوب', 'mona.saeed@stu.ust.edu.ye', '778456791', 2, 4, 1, 4, 1, 'active', 15, 51.0, 3.40, 'active', '2025-09-01', '2029-06-15', 'يمنية', '2005-10-09', 'أنثى', 'صنعاء'),
('2024024', 'أسامة فتحي العولقي', 'osama.fathi@stu.ust.edu.ye', '779567892', 1, 3, 2, 3, 1, 'active', 30, 78.0, 2.60, 'active', '2024-09-01', '2028-06-15', 'يمني', '2004-06-22', 'ذكر', 'إب'),
('2024025', 'رزان عبدالملك الحمزي', 'razan.abdulm@stu.ust.edu.ye', '770678903', 4, 9, 2, NULL, 1, 'active', 30, 102.0, 3.40, 'active', '2024-09-01', '2028-06-15', 'يمنية', '2004-02-18', 'أنثى', 'صنعاء');
-- ============================================================
-- ENHANCED SEED DATA - Comprehensive Demo Data
-- ============================================================
BEGIN;
-- 2. ADDITIONAL EMPLOYEES (IDs 9-18)
INSERT INTO employees (employee_code, full_name, email, phone, admin_structure_id, job_title_id, academic_degree, specialization, status) VALUES
('EMP009', 'د. عبدالرحمن العمري', 'abdulrahman.o@ust.edu.ye', '778111222', 8, 3, 'دكتوراه', 'نظم معلومات', 'active'),
('EMP010', 'أ. محمد باوزير', 'mohamed.b@ust.edu.ye', '778222333', 6, 6, 'ماجستير', 'هندسة برمجيات', 'active'),
('EMP011', 'د. نورة القحطاني', 'noura.q@ust.edu.ye', '778333444', 7, 3, 'دكتوراه', 'ذكاء اصطناعي', 'active'),
('EMP012', 'م. أحمد الحمادي', 'ahmad.h@ust.edu.ye', '778444555', 9, 5, 'ماجستير', 'محاسبة', 'active'),
('EMP013', 'د. فاطمة الزهراء', 'fatima.z@ust.edu.ye', '778555666', 2, 4, 'دكتوراه', 'هندسة مدنية', 'active'),
('EMP014', 'أ. سامي الهاشمي', 'sami.h@ust.edu.ye', '778666777', 10, 7, 'بكالوريوس', 'إدارة أعمال', 'active'),
('EMP015', 'م. هند العدني', 'hind.a@ust.edu.ye', '778777888', 6, 8, 'ماجستير', 'تقنية معلومات', 'active'),
('EMP016', 'د. خالد الموسوي', 'khalid.m@ust.edu.ye', '778888999', 7, 3, 'دكتوراه', 'علوم حاسوب', 'active'),
('EMP017', 'أ. ريم الطرفي', 'reem.t@ust.edu.ye', '778999000', 10, 10, 'ماجستير', 'محاسبة', 'active'),
('EMP018', 'م. عادل الداعري', 'adel.d@ust.edu.ye', '778000111', 6, 5, 'ماجستير', 'شبكات', 'active');
-- 3. EMPLOYEE CERTIFICATES
INSERT INTO employee_certificates (employee_id, certificate_name, issuing_authority, year) VALUES
(9, 'شهادة دكتوراه في نظم المعلومات', 'جامعة صنعاء', '2017'),
(10, 'شهادة بكالوريوس هندسة برمجيات', 'جامعة عدن', '2020'),
(11, 'شهادة دكتوراه في الذكاء الاصطناعي', 'جامعة الملك سعود', '2019'),
(12, 'شهادة ماجستير في المحاسبة', 'جامعة صنعاء', '2021'),
(13, 'شهادة دكتوراه في الهندسة المدنية', 'جامعة القاهرة', '2016'),
(14, 'شهادة بكالوريوس إدارة أعمال', 'جامعة صنعاء', '2019'),
(15, 'شهادة ماجستير في تقنية المعلومات', 'جامعة الملك فهد', '2020'),
(16, 'شهادة دكتوراه في علوم الحاسوب', 'جامعة عدن', '2018'),
(17, 'شهادة ماجستير في المحاسبة', 'جامعة صنعاء', '2022'),
(18, 'شهادة ماجستير في الشبكات', 'جامعة صنعاء', '2021');
-- 4. EMPLOYEE ASSIGNMENTS
INSERT INTO employee_assignments (employee_id, branch_id, department_id, study_subject_id, study_group_id, study_level_id, academic_semester_id) VALUES
(9, 1, 5, 8, 5, 3, 1), (10, 1, 1, 1, 2, 1, 1), (11, 1, 4, 10, 4, 4, 1),
(12, 1, 9, 11, NULL, 3, 1), (13, 1, 3, 15, 3, 1, 1), (14, 1, 10, 12, NULL, 3, 1),
(16, 1, 4, 2, 4, 2, 1), (18, 1, 2, 5, 2, 2, 1);
-- 5. FACULTY PREFERENCES
INSERT INTO faculty_preferences (employee_id, max_hours_per_week, max_hours_per_day, preferred_start_time, preferred_end_time, available_days, preferred_building_id, break_day, notes) VALUES
(9, 18, 6, '08:00', '14:00', 'الأحد,الإثنين,الثلاثاء,الأربعاء', 2, 'الخميس', NULL),
(10, 16, 5, '08:00', '15:00', 'السبت,الأحد,الإثنين,الثلاثاء', 1, 'الخميس', NULL),
(11, 15, 5, '09:00', '14:00', 'الأحد,الثلاثاء,الأربعاء', 2, 'الإثنين', NULL),
(13, 12, 4, '08:00', '12:00', 'الأحد,الإثنين', 1, 'الثلاثاء', NULL),
(16, 18, 6, '08:00', '16:00', 'السبت,الأحد,الإثنين,الثلاثاء,الأربعاء', 2, NULL, NULL);
-- 6. STUDY SCHEDULES (additional)
INSERT INTO study_schedules (college_id, academic_semester_id, day_of_week, start_time, end_time, study_subject_id, employee_id, external_employee_id, study_group_id, study_level_id, room, notes) VALUES
(2, 1, 'Monday', '10:00', '12:00', 17, 11, NULL, 4, 4, 'B201', 'برمجة ويب متقدمة'),
(2, 1, 'Tuesday', '10:00', '12:00', 18, 11, NULL, 5, 4, 'B202', 'تعلم الآلة'),
(1, 1, 'Wednesday', '08:00', '10:00', 20, NULL, 5, 2, 3, 'B203', 'شبكات متقدمة'),
(2, 1, 'Sunday', '12:00', '14:00', 22, 3, NULL, 4, 1, 'B201', 'برمجة بايثون'),
(1, 1, 'Monday', '08:00', '10:00', 23, 1, NULL, 1, 2, 'A101', 'إحصاء'),
(4, 1, 'Sunday', '10:00', '12:00', 12, 14, NULL, NULL, 3, 'D401', 'إدارة استراتيجية'),
(2, 1, 'Wednesday', '10:00', '12:00', 19, 4, NULL, 5, 4, 'B201', 'قواعد بيانات متقدمة'),
(1, 1, 'Thursday', '08:00', '10:00', 21, 2, NULL, 1, 4, 'A101', 'هندسة معرفة');
-- 7. LECTURES (from new schedules)
INSERT INTO lectures (study_schedule_id, study_subject_id, study_group_id, program_id, study_level_id, academic_semester_id, employee_id, room_id, day_of_week, start_time, end_time, lecture_type, status)
SELECT ss.id, ss.study_subject_id, ss.study_group_id, 1, ss.study_level_id, 1, ss.employee_id, r.id, ss.day_of_week, ss.start_time, ss.end_time, 'theory', 'scheduled'
FROM study_schedules ss
CROSS JOIN LATERAL (SELECT id FROM rooms WHERE room_code = ss.room LIMIT 1) r
WHERE ss.id > 9 AND ss.employee_id IS NOT NULL;
-- 8. GUARDIANS (additional)
INSERT INTO guardians (full_name, phone, email, address, relation_type) VALUES
('أحمد باوزير', '775123456', 'ahmed.b@example.com', 'صنعاء', 'أب'),
('سعيد المقطري', '776234567', 'saeed.m@example.com', 'عدن', 'أب'),
('محمد الحمادي', '777345678', 'mohammed.h@example.com', 'تعز', 'أب'),
('خالد البكري', '778456789', 'khaled.b@example.com', 'صنعاء', 'أب'),
('صالح الراشد', '779567890', 'saleh.r@example.com', 'ذمار', 'أب'),
('علي العولقي', '770678902', 'ali.a@example.com', 'صنعاء', 'أب'),
('عبدالرحمن الجوفي', '777345680', 'abdo.j@example.com', 'عدن', 'أب'),
('فتحي الهاشمي', '771789013', 'fathi.h@example.com', 'عدن', 'أب'),
('ناصر الموسوي', '773901235', 'nasser.m@example.com', 'إب', 'أب'),
('سالم القاضي', '775123458', 'saleh.q@example.com', 'تعز', 'أب');
INSERT INTO guardian_students (guardian_id, student_id) VALUES
(6, 15), (7, 16), (8, 17), (9, 18), (10, 19),
(11, 20), (12, 21), (13, 22), (14, 23), (15, 24);
-- 9. ADDITIONAL EXAMS (IDs 8-20)
INSERT INTO exams (title, subject_id, duration_minutes, total_marks, pass_mark, exam_date, start_time, status) VALUES
('اختبار منتصف الفصل - تعلم الآلة', 18, 90, 100, 50, '2025-11-08', '10:00', 'published'),
('اختبار عملي - شبكات', 5, 120, 50, 25, '2025-11-12', '14:00', 'published'),
('اختبار منتصف الفصل - أمن المعلومات', 9, 60, 100, 50, '2025-11-15', '10:00', 'published'),
('اختبار منتصف الفصل - تحليل وتصميم نظم', 8, 60, 100, 50, '2025-11-18', '10:00', 'published'),
('اختبار نهائي - مقدمة في البرمجة', 1, 120, 100, 50, '2026-01-10', '09:00', 'draft'),
('اختبار نهائي - هياكل بيانات', 2, 120, 100, 50, '2026-01-12', '09:00', 'draft'),
('اختبار نهائي - قواعد بيانات', 3, 120, 100, 50, '2026-01-14', '09:00', 'draft'),
('اختبار منتصف الفصل - المحاسبة المالية', 11, 60, 100, 50, '2025-11-20', '10:00', 'published'),
('اختبار عملي - تشريح بشري', 13, 90, 50, 25, '2025-11-22', '14:00', 'published'),
('اختبار منتصف الفصل - هندسة مدنية', 15, 60, 100, 50, '2025-11-25', '10:00', 'published'),
('اختبار منتصف الفصل - تسويق إلكتروني', 16, 60, 100, 50, '2025-11-28', '10:00', 'published'),
('اختبار عملي - البرمجة بلغة Python', 22, 90, 50, 25, '2025-12-01', '14:00', 'published'),
('اختبار منتصف الفصل - شبكات الجيل الخامس', 20, 60, 100, 50, '2025-12-05', '10:00', 'published');
-- 10. EXAM QUESTIONS (additional)
INSERT INTO exam_questions (exam_id, question_text, question_type, options, correct_answer, marks, sort_order) VALUES
(8, 'ما هو التعلم الآلة؟', 'multiple_choice', '["نوع من البرمجة","طريقة للتعلم من البيانات","نوع من قواعد البيانات","نوع من الشبكات"]', 'طريقة للتعلم من البيانات', 5, 1),
(8, 'أي من التالي ليس من أنماط التعلم الآلة؟', 'multiple_choice', '["المراقب","غير المراقب","شبه المراقب","التماثلي"]', 'التماثلي', 5, 2),
(9, 'ما هو بروتوكول TCP/IP؟', 'multiple_choice', '["بروتوكول لنقل الملفات","مجموعة بروتوكولات الاتصال","نوع من الشبكات","برنامج إدارة"]', 'مجموعة بروتوكولات الاتصال', 5, 1),
(9, 'ما هي طبقة التطبيق في نموذج OSI؟', 'multiple_choice', '["الطبقة الأولى","الطبقة السابعة","الطبقة الرابعة","الطبقة الخامسة"]', 'الطبقة السابعة', 5, 2),
(10, 'ما هو اختراق الأمان؟', 'multiple_choice', '["تحديث للنظام","استغلال ثغرة أمنية","تثبيت برنامج","تشغيل جهاز"]', 'استغلال ثغرة أمنية', 5, 1),
(10, 'أي من التالي يُستخدم للتشفير؟', 'multiple_choice', '["Firewall","AES","Router","Switch"]', 'AES', 5, 2),
(11, 'ما هو مخطط UML؟', 'multiple_choice', '["لغة برمجة","لغة ترميز موحدة","نوع من قواعد البيانات","بروتوكول شبكات"]', 'لغة ترميز موحدة', 5, 1),
(11, 'ما هي مرحلة تصميم النظام؟', 'multiple_choice', '["تحليل المتطلبات","تحديد المشكلة","البرمجة والاختبار","الصيانة"]', 'تحليل المتطلبات', 5, 2),
(14, 'ما هو رأس المال العامل؟', 'multiple_choice', '["الأصول طويلة الأجل","الأصول قصيرة الأجل ناقص الخصوم","صافي الأصول","الديون"]', 'الأصول قصيرة الأجل ناقص الخصوم', 5, 1),
(15, 'ما هو المعدل التراكمي (GPA)؟', 'multiple_choice', '["متوسط الدرجات","مجموع نقاط الدرجات مقسوما على مجموع الساعات","نسبة النجاح","عدد المواد"]', 'مجموع نقاط الدرجات مقسوما على مجموع الساعات', 5, 1),
(16, 'ما هو التسويق الإلكتروني؟', 'multiple_choice', '["التسويق عبر التلفزيون","التسويق عبر الإنترنت","التسويق بالبريد العادي","التسويق بالهاتف"]', 'التسويق عبر الإنترنت', 5, 1),
(17, 'ما هي مكتبة NumPy في Python؟', 'multiple_choice', '["مكتبة للمصفوفات والحسابات الرياضية","مكتبة للرسوم البيانية","مكتبة لقواعد البيانات","مكتبة للشبكات"]', 'مكتبة للمصفوفات والحسابات الرياضية', 5, 1),
(18, 'ما هو الـ Router؟', 'multiple_choice', '["جهاز لتوجيه حركة المرور","جهاز لإنشاء الشبكة","جهاز للطباعة","جهاز للتخزين"]', 'جهاز لتوجيه حركة المرور', 5, 1);
-- 11. ADDITIONAL REQUESTS (IDs 6-25)
INSERT INTO requests (user_id_number, branch_id, college_id, lab_id, location_name, issue_type_id, study_level_id, department_id, course_name, priority, details, status, created_at) VALUES
('2024005', 1, 1, 3, 'معمل الشبكات', 1, 2, 2, 'شبكات الحاسوب', 'High', 'جهاز التوجيه لا يعمل', 'In Progress', '2025-10-20 08:30:00'),
('2024006', 1, 1, 4, 'معمل البرمجيات', 1, 2, 1, 'هندسة البرمجيات', 'Medium', 'حاجز الشاشة مكسور', 'Pending', '2025-10-22 09:00:00'),
('EMP002', 1, 1, NULL, 'مكتب هندسة البرمجيات', 2, NULL, 1, NULL, 'Low', 'طلب ترقية برنامج MATLAB', 'Resolved', '2025-10-25 11:00:00'),
('2024007', 1, 1, NULL, 'قاعة A101', 5, 1, 1, 'رياضيات هندسية', 'High', 'السبورة الإلكترونية لا تعمل', 'In Progress', '2025-10-28 13:00:00'),
('2024008', 1, 1, 3, 'معمل الشبكات', 3, 3, 2, 'شبكات الحاسوب', 'Medium', 'استفسار عن مواعيد المعمل', 'Resolved', '2025-11-01 10:00:00'),
('2024009', 1, 1, NULL, 'مكتبة الجامعة', 6, 2, 1, NULL, 'Low', 'استفسار عن توفر كتاب', 'Resolved', '2025-11-03 08:30:00'),
('2023013', 1, 2, 1, 'معمل الحاسوب 1', 1, 3, 4, 'أمن المعلومات', 'High', 'جهاز مصاب بفيروس', 'In Progress', '2025-11-05 09:00:00'),
('2023014', 1, 2, 2, 'قاعة B202', 4, 3, 5, 'تحليل وتصميم نظم', 'Normal', 'تأخر في صرف مكافأة البحث', 'Pending', '2025-11-07 11:00:00'),
('EMP003', 1, 2, NULL, 'مكتب علوم الحاسوب', 7, NULL, 4, NULL, 'Medium', 'شكوى من بطء النظام', 'In Progress', '2025-11-08 14:00:00'),
('2024010', 1, 2, 1, 'معمل الحاسوب 1', 1, 2, 4, 'هياكل بيانات', 'High', 'جهاز لا يشغّل Visual Studio', 'Pending', '2025-11-10 08:30:00'),
('2024011', 1, 2, 2, 'قاعة B202', 3, 1, 4, 'مقدمة في البرمجة', 'Low', 'استفسار عن موعد الامتحان', 'Resolved', '2025-11-12 10:00:00'),
('2024012', 1, 2, NULL, 'الإدارة العامة', 6, 2, 5, NULL, 'Normal', 'استفسار عن التسجيل في المكتبة', 'Resolved', '2025-11-14 09:00:00'),
('2023015', 1, 1, NULL, 'مبنى الهندسة', 2, 3, 1, NULL, 'High', 'تأخر في إصدار شهادة التخرج', 'Pending', '2025-11-15 11:00:00'),
('2022016', 1, 2, 1, 'معمل الحاسوب 1', 1, 4, 4, 'أمن المعلومات', 'Medium', 'الطابعة لا تعمل', 'In Progress', '2025-11-17 08:30:00'),
('2022017', 1, 1, 3, 'معمل الشبكات', 5, 4, 3, 'هندسة مدنية', 'High', 'مكيف المعمل معطل', 'Pending', '2025-11-19 13:00:00'),
('EMP005', 1, 1, NULL, 'مكتب التدريس', 2, NULL, 1, NULL, 'Normal', 'طلب تحديث أجهزة العرض', 'In Progress', '2025-11-20 10:00:00'),
('2024019', 1, 1, NULL, 'النظام الأكاديمي', 7, 1, 1, NULL, 'Medium', 'شكوى من صعوبة تسجيل المواد', 'Pending', '2025-11-22 09:00:00'),
('2024020', 1, 4, NULL, 'مكتب المحاسبة', 6, 1, 9, NULL, 'Low', 'استفسار عن الرسوم الدراسية', 'Resolved', '2025-11-24 11:00:00'),
('2024021', 1, 4, NULL, 'مكتب إدارة الأعمال', 4, 2, 10, NULL, 'Normal', 'تأخر في صرف رواتب الموظفين', 'In Progress', '2025-11-25 14:00:00'),
('2024023', 1, 2, 1, 'معمل الحاسوب 1', 1, 1, 4, 'مقدمة في البرمجة', 'High', 'شاشة الحاسوب مكسورة', 'Pending', '2025-11-27 08:30:00');
-- 12. ADDITIONAL TASKS (IDs 5-20)
INSERT INTO tasks (request_id, assigned_to, created_by, title, details, priority, status, created_at) VALUES
(6, 7, 1, 'إصلاح جهاز التوجيه', 'إصلاح جهاز التوجيه في معمل الشبكات', 'High', 'In Progress', '2025-10-20 09:00:00'),
(7, 8, 1, 'إصلاح حاجز الشاشة', 'استبدال حاجز الشاشة المكسور', 'Normal', 'Pending', '2025-10-22 09:30:00'),
(8, 7, 1, 'تحديث برنامج MATLAB', 'تثبيت أحدث إصدار من MATLAB', 'Low', 'Completed', '2025-10-25 11:30:00'),
(9, 8, 1, 'إصلاح السبورة الإلكترونية', 'فحص وإصلاح السبورة الإلكترونية', 'High', 'In Progress', '2025-10-28 13:30:00'),
(12, 7, 1, 'إزالة فيروس من الحاسوب', 'فحص وإزالة الفيروس من أجهزة المعمل', 'High', 'In Progress', '2025-11-05 09:30:00'),
(13, 6, 1, 'متابعة صرف المكافآت', 'التحقق من حالة صرف مكافآت البحث', 'Normal', 'Pending', '2025-11-07 11:30:00'),
(14, 7, 1, 'تحسين سرعة النظام', 'تحسين أداء النظام الأكاديمي', 'Normal', 'In Progress', '2025-11-08 14:30:00'),
(15, 8, 1, 'تثبيت Visual Studio', 'تثبيت برنامج Visual Studio على أجهزة المعمل', 'Normal', 'Pending', '2025-11-10 09:00:00'),
(18, 8, 1, 'إصلاح الطابعة', 'إصلاح الطابعة في معمل الحاسوب 1', 'Medium', 'Completed', '2025-11-17 09:00:00'),
(19, 8, 1, 'إصلاح مكيف المعمل', 'طلب صيانة لمكيف معمل الشبكات', 'High', 'Pending', '2025-11-19 13:30:00'),
(20, 7, 1, 'تحديث أجهزة العرض', 'تحديث جهاز العرض في قاعة المحاضرات', 'Normal', 'In Progress', '2025-11-20 10:30:00'),
(22, 6, 1, 'مراجعة الرسوم المالية', 'مراجعة استفسار الطالب عن الرسوم', 'Low', 'Completed', '2025-11-24 11:30:00'),
(23, 7, 1, 'متابعة صرف الرواتب', 'التحقق من حالة صرف رواتب الموظفين', 'Normal', 'In Progress', '2025-11-25 14:30:00'),
(24, 8, 1, 'إصلاح شاشة الحاسوب', 'استبدال شاشة الحاسوب المكسورة', 'High', 'Pending', '2025-11-27 09:00:00'),
(16, 6, 1, 'مراجعة شهادة التخرج', 'مراجعة طلب إصدار شهادة التخرج', 'Normal', 'Pending', '2025-11-15 11:30:00');
-- 13. EXAM SCHEDULES (additional IDs 6-13)
INSERT INTO exam_schedules (exam_id, room_id, exam_date, start_time, end_time, student_count, proctor_id, proctor2_id, status) VALUES
(8, 3, '2025-11-08', '10:00', '11:30', 25, 3, 7, 'completed'),
(9, 4, '2025-11-12', '14:00', '16:00', 30, 5, 3, 'completed'),
(10, 3, '2025-11-15', '10:00', '11:00', 20, 1, 4, 'completed'),
(11, 1, '2025-11-18', '10:00', '11:00', 15, 2, NULL, 'completed'),
(14, 3, '2025-11-20', '10:00', '11:00', 30, 6, 17, 'completed'),
(15, 3, '2025-11-22', '14:00', '15:30', 40, 5, 3, 'completed'),
(16, 1, '2025-11-25', '10:00', '11:00', 15, 2, NULL, 'completed'),
(17, 1, '2025-11-28', '10:00', '11:00', 15, 13, NULL, 'completed');
-- 14. EXAM SEATING (additional)
INSERT INTO exam_seating (exam_schedule_id, student_id, seat_number, row_number, column_number, attendance_status, check_in_time) VALUES
(6, 5, 'D-01', 1, 1, 'present', '2025-11-08 09:55:00'),
(6, 8, 'D-02', 1, 2, 'present', '2025-11-08 09:58:00'),
(6, 13, 'D-03', 1, 3, 'late', '2025-11-08 10:10:00'),
(7, 1, 'E-01', 1, 1, 'present', '2025-11-12 13:55:00'),
(7, 5, 'E-02', 1, 2, 'present', '2025-11-12 13:58:00'),
(8, 5, 'F-01', 1, 1, 'present', '2025-11-15 09:55:00'),
(8, 13, 'F-02', 1, 2, 'absent', NULL),
(9, 7, 'G-01', 1, 1, 'present', '2025-11-18 09:55:00'),
(10, 1, 'H-01', 1, 1, 'present', '2025-11-20 09:58:00'),
(10, 5, 'H-02', 1, 2, 'present', '2025-11-20 10:00:00'),
(11, 1, 'I-01', 1, 1, 'present', '2025-11-22 13:55:00'),
(11, 7, 'I-02', 1, 2, 'late', '2025-11-22 14:08:00'),
(12, 5, 'J-01', 1, 1, 'present', '2025-11-25 09:55:00'),
(12, 8, 'J-02', 1, 2, 'present', '2025-11-25 09:58:00'),
(13, 7, 'K-01', 1, 1, 'present', '2025-11-28 09:55:00');
-- 15. EXAM GRADES (additional IDs 8-36)
INSERT INTO exam_grades (exam_id, student_id, score, percentage, grade_letter, status, graded_by, graded_at, notes) VALUES
(8, 5, 82, 82, 'B', 'published', 3, '2025-11-10 14:00:00', NULL),
(8, 8, 68, 68, 'D+', 'published', 3, '2025-11-10 14:00:00', NULL),
(8, 13, 55, 55, 'D', 'published', 3, '2025-11-10 14:00:00', NULL),
(9, 1, 42, 84, 'B+', 'published', 5, '2025-11-14 16:00:00', NULL),
(9, 5, 38, 76, 'C+', 'published', 5, '2025-11-14 16:00:00', NULL),
(10, 5, 78, 78, 'C+', 'published', 1, '2025-11-17 12:00:00', NULL),
(10, 13, 45, 45, 'F', 'published', 1, '2025-11-17 12:00:00', NULL),
(11, 7, 85, 85, 'B+', 'published', 2, '2025-11-20 12:00:00', NULL),
(14, 1, 72, 72, 'C', 'published', 6, '2025-11-22 12:00:00', NULL),
(14, 2, 88, 88, 'B+', 'published', 6, '2025-11-22 12:00:00', NULL),
(14, 5, 65, 65, 'D', 'published', 6, '2025-11-22 12:00:00', NULL),
(14, 8, 58, 58, 'D', 'published', 6, '2025-11-22 12:00:00', NULL),
(15, 1, 45, 90, 'A-', 'published', 5, '2025-11-24 15:00:00', NULL),
(15, 3, 38, 76, 'C+', 'published', 5, '2025-11-24 15:00:00', NULL),
(15, 7, 42, 84, 'B+', 'published', 5, '2025-11-24 15:00:00', NULL),
(16, 5, 82, 82, 'B', 'published', 2, '2025-11-27 12:00:00', NULL),
(16, 10, 70, 70, 'C', 'published', 2, '2025-11-27 12:00:00', NULL),
(17, 7, 75, 75, 'C', 'published', 13, '2025-11-30 12:00:00', NULL),
(17, 13, 62, 62, 'D', 'published', 13, '2025-11-30 12:00:00', NULL),
(2, 8, 55, 55, 'D', 'published', 3, '2025-11-06 10:00:00', NULL),
(3, 1, 90, 90, 'A-', 'published', 3, '2025-11-07 14:00:00', NULL),
(3, 2, 95, 95, 'A', 'published', 3, '2025-11-07 14:00:00', NULL),
(4, 1, 72, 72, 'C', 'published', 1, '2025-11-12 12:00:00', NULL),
(4, 2, 85, 85, 'B+', 'published', 1, '2025-11-12 12:00:00', NULL),
(5, 7, 88, 88, 'B+', 'published', 2, '2025-11-05 14:00:00', NULL),
(6, 1, 78, 78, 'C+', 'published', 1, '2025-11-08 14:00:00', NULL),
(6, 2, 92, 92, 'A', 'published', 1, '2025-11-08 14:00:00', NULL),
(7, 1, 85, 85, 'B+', 'published', 1, '2025-11-14 14:00:00', NULL),
(7, 2, 90, 90, 'A-', 'published', 1, '2025-11-14 14:00:00', NULL);
-- 16. ATTENDANCE SESSIONS (additional IDs 7-30)
INSERT INTO attendance_sessions (lecture_id, study_subject_id, employee_id, session_date, start_time, end_time, session_type, status) VALUES
(1, 1, 3, '2025-10-19', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-10-19', '10:00', '12:00', 'lecture', 'completed'),
(3, 4, 2, '2025-10-20', '08:00', '10:00', 'lecture', 'completed'),
(4, 1, 5, '2025-10-21', '08:00', '10:00', 'lecture', 'completed'),
(1, 1, 3, '2025-10-26', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-10-26', '10:00', '12:00', 'lecture', 'completed'),
(3, 4, 2, '2025-10-27', '08:00', '10:00', 'lecture', 'completed'),
(4, 1, 5, '2025-10-28', '08:00', '10:00', 'lecture', 'completed'),
(1, 1, 3, '2025-11-02', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-11-02', '10:00', '12:00', 'lecture', 'completed'),
(5, 3, 4, '2025-11-03', '10:00', '12:00', 'lecture', 'completed'),
(6, 5, 7, '2025-11-04', '08:00', '10:00', 'lab', 'completed'),
(1, 1, 3, '2025-11-09', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-11-09', '10:00', '12:00', 'lecture', 'completed'),
(8, 6, 1, '2025-11-10', '10:00', '12:00', 'lecture', 'completed'),
(9, 7, 1, '2025-11-11', '12:00', '14:00', 'lecture', 'completed'),
(1, 1, 3, '2025-11-16', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-11-16', '10:00', '12:00', 'lecture', 'completed'),
(5, 3, 4, '2025-11-17', '10:00', '12:00', 'lecture', 'completed'),
(10, 8, 4, '2025-11-18', '10:00', '12:00', 'lecture', 'completed'),
(1, 1, 3, '2025-11-23', '08:00', '10:00', 'lecture', 'completed'),
(2, 2, 3, '2025-11-23', '10:00', '12:00', 'lecture', 'completed');
-- 17. ATTENDANCE RECORDS (additional)
INSERT INTO attendance_records (attendance_session_id, student_id, status, check_in_time, late_minutes) VALUES
(7, 1, 'present', '2025-10-19 08:02:00', 2), (7, 2, 'present', '2025-10-19 07:58:00', 0),
(7, 3, 'late', '2025-10-19 08:15:00', 15), (8, 1, 'present', '2025-10-19 10:00:00', 0),
(8, 2, 'late', '2025-10-19 10:08:00', 8), (8, 3, 'present', '2025-10-19 10:01:00', 1),
(9, 7, 'present', '2025-10-20 08:00:00', 0), (9, 3, 'present', '2025-10-20 08:00:00', 0),
(10, 1, 'present', '2025-10-21 07:55:00', 0), (10, 2, 'present', '2025-10-21 08:00:00', 0),
(10, 3, 'absent', NULL, 0), (11, 1, 'present', '2025-10-26 08:00:00', 0),
(11, 2, 'present', '2025-10-26 08:02:00', 2), (12, 1, 'present', '2025-10-26 10:00:00', 0),
(12, 2, 'absent', NULL, 0), (13, 7, 'present', '2025-10-27 08:00:00', 0),
(13, 3, 'present', '2025-10-27 08:03:00', 3), (14, 1, 'late', '2025-10-28 08:12:00', 12),
(14, 2, 'present', '2025-10-28 08:00:00', 0), (15, 1, 'present', '2025-11-02 08:00:00', 0),
(15, 2, 'present', '2025-11-02 08:01:00', 1), (15, 3, 'late', '2025-11-02 08:20:00', 20),
(16, 1, 'present', '2025-11-02 10:00:00', 0), (16, 2, 'present', '2025-11-02 10:05:00', 5),
(17, 7, 'present', '2025-11-03 10:00:00', 0), (18, 1, 'present', '2025-11-04 08:00:00', 0),
(18, 3, 'present', '2025-11-04 08:00:00', 0), (19, 1, 'present', '2025-11-09 08:00:00', 0),
(19, 2, 'late', '2025-11-09 08:10:00', 10), (20, 1, 'present', '2025-11-09 10:00:00', 0),
(21, 1, 'present', '2025-11-10 10:00:00', 0), (21, 5, 'present', '2025-11-10 10:02:00', 2),
(22, 1, 'present', '2025-11-11 12:00:00', 0), (22, 2, 'present', '2025-11-11 12:00:00', 0),
(23, 1, 'present', '2025-11-16 08:00:00', 0), (23, 2, 'present', '2025-11-16 08:00:00', 0),
(23, 3, 'absent', NULL, 0), (24, 1, 'present', '2025-11-16 10:00:00', 0),
(25, 7, 'present', '2025-11-17 10:00:00', 0), (25, 3, 'present', '2025-11-17 10:01:00', 1),
(26, 5, 'present', '2025-11-18 10:00:00', 0), (27, 1, 'present', '2025-11-23 08:00:00', 0),
(27, 2, 'present', '2025-11-23 08:00:00', 0), (27, 3, 'late', '2025-11-23 08:18:00', 18),
(28, 1, 'present', '2025-11-23 10:00:00', 0), (28, 2, 'absent', NULL, 0),
(29, 7, 'present', '2025-11-24 10:00:00', 0), (30, 5, 'present', '2025-11-25 10:00:00', 0);
-- 18. LIBRARY BOOKS (additional IDs 10-25)
INSERT INTO library_books (title, title_en, author, publisher, isbn, edition, publication_year, category, book_type, total_copies, available_copies, shelf_location, description, status) VALUES
('الخوارزميات والهياكل البيانات', 'Algorithms and Data Structures', 'Robert Sedgewick', 'Addison Wesley', '9780321573513', 4, 2011, 'علوم حاسوب', 'printed', 6, 4, 'رف A-05', NULL, 'available'),
('البرمجة بلغة Java', 'Java Programming', 'Daniel Liang', 'Pearson', '9780134670959', 11, 2018, 'برمجة', 'printed', 8, 7, 'رف A-06', NULL, 'available'),
('شبكات الحاسوب', 'Computer Networks', 'James Kurose', 'Pearson', '9780133594140', 8, 2021, 'شبكات', 'printed', 5, 3, 'رف B-03', NULL, 'available'),
('هندسة البرمجيات الحديثة', 'Modern Software Engineering', 'David Farley', 'Addison Wesley', '9780137314911', 1, 2021, 'هندسة', 'printed', 4, 4, 'رف B-04', NULL, 'available'),
('تعلم العميق', 'Deep Learning', 'Ian Goodfellow', 'MIT Press', '9780262035613', 1, 2016, 'ذكاء اصطناعي', 'printed', 3, 2, 'رف A-07', NULL, 'available'),
('أساسيات قواعد البيانات', 'Fundamentals of Database Systems', 'Elmasri', 'Pearson', '9780133970777', 7, 2016, 'علوم حاسوب', 'printed', 6, 5, 'رف A-08', NULL, 'available'),
('مبادئ التسويق', 'Principles of Marketing', 'Philip Kotler', 'Pearson', '9780135210895', 18, 2020, 'تسويق', 'printed', 4, 4, 'رف D-02', NULL, 'available'),
('المحاسبة المالية', 'Financial Accounting', 'Weygandt', 'Wiley', '9781119796022', 5, 2021, 'محاسبة', 'printed', 5, 5, 'رف D-03', NULL, 'available'),
('الأمن السيبراني', 'Cybersecurity Fundamentals', 'Jeanne Contee', 'Jones and Bartlett', '9781284130195', 1, 2020, 'أمن', 'printed', 4, 3, 'رف A-09', NULL, 'available'),
('التحليل الإحصائي', 'Statistical Analysis', 'Ronald Walpole', 'Pearson', '9780328763184', 10, 2016, 'إحصاء', 'printed', 3, 3, 'رف A-10', NULL, 'available'),
('الهندسة المدنية', 'Civil Engineering Principles', 'Prab Bhatt', 'Pearson', '9780132553339', 6, 2016, 'هندسة', 'printed', 4, 4, 'رف B-05', NULL, 'available'),
('التشريح والفيزيولوجيا', 'Anatomy and Physiology', 'Marieb', 'Pearson', '9780135203880', 12, 2018, 'طب', 'printed', 5, 4, 'رف C-02', NULL, 'available'),
('Python للمحترفين', 'Python for Professionals', 'Mark Lutz', 'OReilly', '9781449355739', 4, 2013, 'برمجة', 'printed', 6, 5, 'رف A-11', NULL, 'available'),
('الشبكات اللاسلكية', 'Wireless Communications', 'Andrea Goldsmith', 'Cambridge', '9780521515511', 1, 2005, 'شبكات', 'printed', 3, 3, 'رف B-06', NULL, 'available'),
('مبادئ الاقتصاد', 'Principles of Economics', 'N. Gregory Mankiw', 'Cengage', '9781337613736', 8, 2017, 'اقتصاد', 'printed', 4, 4, 'رف D-04', NULL, 'available'),
('فن البرمجة', 'The Art of Programming', 'Donald Knuth', 'Addison Wesley', '9780201896831', 1, 1997, 'برمجة', 'printed', 2, 1, 'رف A-12', 'كتاب كلاسيكي', 'available');
-- 19. LIBRARY BORROWINGS (additional IDs 7-20)
INSERT INTO library_borrowings (book_id, student_id, employee_id, borrowed_by_type, borrow_date, due_date, return_date, status, notes) VALUES
(2, 1, NULL, 'student', '2025-11-01', '2025-11-29', NULL, 'borrowed', NULL),
(3, 5, NULL, 'student', '2025-11-05', '2025-12-03', NULL, 'borrowed', NULL),
(4, 2, NULL, 'student', '2025-11-10', '2025-12-08', NULL, 'borrowed', NULL),
(5, 8, NULL, 'student', '2025-11-12', '2025-12-10', NULL, 'overdue', 'تأخر في الإرجاع'),
(6, 1, NULL, 'student', '2025-11-15', '2025-12-13', NULL, 'borrowed', NULL),
(8, 3, NULL, 'student', '2025-10-20', '2025-11-17', '2025-11-15', 'returned', NULL),
(9, 5, NULL, 'student', '2025-10-25', '2025-11-22', NULL, 'overdue', 'تأخر في الإرجاع'),
(10, NULL, 2, 'employee', '2025-11-01', '2025-12-01', NULL, 'borrowed', NULL),
(11, 2, NULL, 'student', '2025-11-08', '2025-12-06', NULL, 'borrowed', NULL),
(12, 7, NULL, 'student', '2025-11-10', '2025-12-08', NULL, 'borrowed', NULL),
(13, NULL, 3, 'employee', '2025-11-12', '2025-12-12', NULL, 'borrowed', NULL),
(14, 1, NULL, 'student', '2025-11-15', '2025-12-13', NULL, 'borrowed', NULL),
(15, 8, NULL, 'student', '2025-10-01', '2025-10-29', '2025-10-25', 'returned', NULL),
(16, 2, NULL, 'student', '2025-11-20', '2025-12-18', NULL, 'borrowed', NULL);
-- 20. LIBRARY FINES (additional IDs 3-8)
INSERT INTO library_fines (borrowing_id, fine_type, amount, days_overdue, is_paid, notes) VALUES
(5, 'overdue', 7000, 14, false, 'غرامة تأخير 14 يوم'),
(9, 'overdue', 5000, 10, false, 'غرامة تأخير 10 أيام'),
(9, 'damage', 2000, 0, false, 'تلف الغلاف'),
(4, 'overdue', 4000, 7, true, 'غرامة تأخير - تم السداد'),
(2, 'overdue', 3000, 5, false, 'غرامة تأخير 5 أيام');
-- 21. LIBRARY RESERVATIONS (additional IDs 4-10)
INSERT INTO library_reservations (book_id, student_id, employee_id, reserved_by_type, reservation_date, expiry_date, status) VALUES
(2, 15, NULL, 'student', '2025-11-25', '2025-12-09', 'active'),
(3, 2, NULL, 'student', '2025-11-20', '2025-12-04', 'active'),
(5, 1, NULL, 'student', '2025-11-18', '2025-12-02', 'active'),
(7, NULL, 5, 'employee', '2025-11-15', '2025-11-29', 'fulfilled'),
(9, 3, NULL, 'student', '2025-11-22', '2025-12-06', 'active'),
(11, 7, NULL, 'student', '2025-11-28', '2025-12-12', 'active'),
(13, 1, NULL, 'student', '2025-11-30', '2025-12-14', 'active');
-- 22. STUDENT FEES (additional IDs 11-35)
INSERT INTO student_fees (student_id, fee_type_id, amount, discount, discount_reason, due_date, status, paid_amount, remaining_amount, academic_semester_id, notes) VALUES
(7, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(8, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(9, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(10, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(11, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(12, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(13, 1, 500000, 0, NULL, '2025-10-01', 'partial', 250000, 250000, 1, 'بقي نصف المبلغ'),
(14, 1, 500000, 50000, 'منحة نسبية', '2025-10-01', 'paid', 450000, 0, 1, NULL),
(15, 1, 600000, 0, NULL, '2025-10-01', 'paid', 600000, 0, 1, NULL),
(16, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(17, 1, 500000, 50000, 'منحة تفوق', '2025-10-01', 'paid', 450000, 0, 1, NULL),
(18, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(19, 1, 500000, 0, NULL, '2025-10-01', 'unpaid', 0, 500000, 1, 'لم يتم السداد'),
(20, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(21, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(22, 1, 500000, 0, NULL, '2025-10-01', 'partial', 300000, 200000, 1, NULL),
(23, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(24, 7, 600000, 0, NULL, '2025-10-01', 'paid', 600000, 0, 1, NULL),
(25, 1, 500000, 0, NULL, '2025-10-01', 'paid', 500000, 0, 1, NULL),
(1, 3, 5000, 0, NULL, '2025-10-01', 'paid', 5000, 0, 1, 'رسوم امتحان'),
(2, 3, 5000, 0, NULL, '2025-10-01', 'paid', 5000, 0, 1, 'رسوم امتحان'),
(3, 4, 10000, 0, NULL, '2025-10-01', 'paid', 10000, 0, 1, 'رسوم معمل'),
(5, 3, 5000, 0, NULL, '2025-10-01', 'paid', 5000, 0, 1, NULL),
(5, 4, 10000, 0, NULL, '2025-10-01', 'paid', 10000, 0, 1, NULL),
(8, 3, 5000, 0, NULL, '2025-10-01', 'paid', 5000, 0, 1, NULL);
-- 23. FEE PAYMENTS (additional IDs 11-35)
INSERT INTO fee_payments (student_fee_id, amount, payment_method, transaction_id, receipt_number, created_by) VALUES
(11, 500000, 'bank_transfer', 'TXN006', 'RCPT011', 6), (12, 500000, 'cash', NULL, 'RCPT012', 6),
(13, 500000, 'bank_transfer', 'TXN007', 'RCPT013', 6), (14, 500000, 'cash', NULL, 'RCPT014', 6),
(15, 500000, 'bank_transfer', 'TXN008', 'RCPT015', 6), (16, 500000, 'cash', NULL, 'RCPT016', 6),
(17, 250000, 'cash', NULL, 'RCPT017', 6), (18, 450000, 'bank_transfer', 'TXN009', 'RCPT018', 6),
(19, 600000, 'cash', NULL, 'RCPT019', 6), (20, 500000, 'bank_transfer', 'TXN010', 'RCPT020', 6),
(21, 450000, 'cash', NULL, 'RCPT021', 6), (22, 500000, 'bank_transfer', 'TXN011', 'RCPT022', 6),
(23, 500000, 'cash', NULL, 'RCPT023', 6), (24, 500000, 'bank_transfer', 'TXN012', 'RCPT024', 6),
(25, 500000, 'cash', NULL, 'RCPT025', 6), (26, 300000, 'cash', NULL, 'RCPT026', 6),
(27, 500000, 'bank_transfer', 'TXN013', 'RCPT027', 6), (28, 600000, 'cash', NULL, 'RCPT028', 6),
(29, 500000, 'bank_transfer', 'TXN014', 'RCPT029', 6), (30, 500000, 'cash', NULL, 'RCPT030', 6),
(31, 5000, 'cash', NULL, 'RCPT031', 6), (32, 5000, 'cash', NULL, 'RCPT032', 6),
(33, 10000, 'bank_transfer', 'TXN015', 'RCPT033', 6), (34, 5000, 'cash', NULL, 'RCPT034', 6),
(35, 10000, 'cash', NULL, 'RCPT035', 6);
-- 24. ACADEMIC RECORDS (additional IDs 14-42)
INSERT INTO academic_records (student_id, study_subject_id, academic_semester_id, employee_id, study_group_id, grade_numeric, grade_letter, grade_points, is_pass, status, attendance_percentage, notes) VALUES
(4, 6, 1, 1, 1, 65, 'D', 1.0, true, 'completed', 80, NULL),
(4, 7, 1, 1, 1, 72, 'C', 2.0, true, 'completed', 85, NULL),
(5, 6, 1, 1, 1, 82, 'B', 3.0, true, 'completed', 90, NULL),
(5, 7, 1, 1, 1, 88, 'B+', 3.5, true, 'completed', 95, NULL),
(6, 1, 1, 3, 4, 90, 'A-', 3.7, true, 'completed', 96, NULL),
(6, 2, 1, 3, 4, 78, 'C+', 2.5, true, 'completed', 88, NULL),
(8, 3, 1, 4, 5, 80, 'B', 3.0, true, 'completed', 92, NULL),
(8, 8, 1, 4, 5, 75, 'C', 2.0, true, 'completed', 85, NULL),
(9, 1, 1, 3, 4, 92, 'A', 4.0, true, 'completed', 98, 'متفوق'),
(9, 2, 1, 3, 4, 88, 'B+', 3.5, true, 'completed', 95, NULL),
(10, 6, 1, 1, 1, 70, 'C', 2.0, true, 'completed', 82, NULL),
(10, 7, 1, 1, 1, 78, 'C+', 2.5, true, 'completed', 88, NULL),
(11, 1, 1, 3, 4, 85, 'B+', 3.5, true, 'completed', 93, NULL),
(12, 2, 1, 3, 5, 82, 'B', 3.0, true, 'completed', 90, NULL),
(13, 1, 1, 3, 4, 55, 'D', 1.0, true, 'completed', 70, 'ضعيف'),
(13, 2, 1, 3, 4, 48, 'F', 0.0, false, 'failed', 65, 'رسوب'),
(14, 3, 1, 4, 5, 85, 'B+', 3.5, true, 'completed', 92, NULL),
(15, 6, 1, 1, 1, 60, 'D', 1.0, true, 'completed', 75, NULL),
(16, 1, 1, 3, 4, 95, 'A', 4.0, true, 'completed', 98, 'متفوق جداً'),
(16, 9, 1, 11, 4, 90, 'A-', 3.7, true, 'completed', 97, NULL),
(17, 6, 1, 1, 1, 72, 'C', 2.0, true, 'completed', 85, NULL),
(19, 6, 1, 1, 2, 50, 'D', 1.0, true, 'completed', 70, NULL),
(19, 7, 1, 1, 2, 45, 'F', 0.0, false, 'failed', 65, 'رسوب'),
(20, 11, 1, 12, NULL, 88, 'B+', 3.5, true, 'completed', 95, NULL),
(21, 12, 1, 14, NULL, 82, 'B', 3.0, true, 'completed', 90, NULL),
(22, 16, 1, 14, NULL, 85, 'B+', 3.5, true, 'completed', 92, NULL),
(23, 1, 1, 3, 4, 92, 'A', 4.0, true, 'completed', 98, NULL),
(24, 15, 1, 13, 3, 70, 'C', 2.0, true, 'completed', 85, NULL),
(25, 11, 1, 12, NULL, 90, 'A-', 3.7, true, 'completed', 96, NULL);
-- 25. STUDENT ENROLLMENTS (additional)
INSERT INTO student_enrollments (student_id, academic_semester_id, enrollment_type, enrollment_date, study_level_id, study_group_id, total_hours, max_hours, status) VALUES
(15, 1, 'regular', '2024-09-01', 2, 1, 15, 20, 'active'),
(16, 1, 'regular', '2024-09-01', 2, 3, 15, 20, 'active'),
(17, 1, 'regular', '2025-09-01', 1, 1, 15, 20, 'active'),
(18, 1, 'regular', '2023-09-01', 3, 3, 15, 18, 'active'),
(19, 1, 'new', '2025-09-01', 1, 2, 15, 20, 'active'),
(20, 1, 'new', '2025-09-01', 1, NULL, 0, 18, 'active'),
(21, 1, 'regular', '2024-09-01', 2, NULL, 15, 18, 'active'),
(22, 1, 'regular', '2024-09-01', 2, NULL, 15, 18, 'active'),
(23, 1, 'regular', '2025-09-01', 1, 4, 15, 20, 'active'),
(24, 1, 'regular', '2024-09-01', 2, 3, 15, 20, 'active'),
(25, 1, 'regular', '2024-09-01', 2, NULL, 15, 18, 'active');
-- 26. SCHOLARSHIPS (additional IDs 6-10)
INSERT INTO scholarships (scholarship_name, scholarship_type, discount_percentage, discount_amount, college_id, program_id, max_students, start_date, end_date, status) VALUES
('منحة الطلاب المتفوقين', 'merit', 40, 0, NULL, NULL, 15, '2025-09-01', '2026-08-31', 'active'),
('منحة الأيتام', 'need_based', 50, 0, NULL, NULL, 20, '2025-09-01', '2026-08-31', 'active'),
('منحة الطلبة الدارسين', 'full', 100, 0, NULL, NULL, 5, '2025-09-01', '2026-08-31', 'active'),
('منحة كلية الطب - متفوق', 'merit', 60, 0, 3, NULL, 8, '2025-09-01', '2026-08-31', 'active'),
('منحة البحث العلمي', 'partial', 30, 0, NULL, NULL, 10, '2025-09-01', '2026-08-31', 'active');
-- 27. STUDENT SCHOLARSHIPS (additional)
INSERT INTO student_scholarships (student_id, scholarship_id, academic_semester_id, status, granted_date, notes) VALUES
(2, 1, 1, 'active', '2025-09-15', 'منحة تفوق'),
(9, 1, 1, 'active', '2025-09-15', 'منحة تفوق'),
(16, 1, 1, 'active', '2025-09-15', 'منحة تفوق - معدل ممتاز'),
(23, 1, 1, 'active', '2025-09-15', 'منحة تفوق'),
(6, 5, 1, 'active', '2025-09-20', 'منحة نسبية'),
(14, 5, 1, 'active', '2025-09-20', 'منحة نسبية'),
(25, 5, 1, 'active', '2025-09-20', 'منحة نسبية');
-- 28. STUDENT SEMESTER GPA (additional)
INSERT INTO student_semester_gpa (student_id, academic_semester_id, semester_hours, semester_gpa, semester_points, cumulative_hours, cumulative_gpa, cumulative_points) VALUES
(4, 1, 8, 1.500, 12.0, 8, 1.500, 12.0),
(6, 1, 8, 3.125, 25.0, 30, 3.400, 102.0),
(7, 1, 8, 3.750, 30.0, 45, 3.000, 135.0),
(8, 1, 8, 2.500, 20.0, 60, 3.200, 192.0),
(9, 1, 8, 3.750, 30.0, 75, 3.500, 262.5),
(10, 1, 8, 2.250, 18.0, 45, 2.900, 130.5),
(11, 1, 8, 3.500, 28.0, 15, 3.500, 28.0),
(12, 1, 8, 3.000, 24.0, 30, 3.000, 90.0),
(13, 1, 8, 0.000, 0.0, 45, 2.600, 117.0),
(14, 1, 8, 3.500, 28.0, 45, 3.100, 139.5),
(15, 1, 8, 1.000, 8.0, 45, 2.400, 108.0),
(16, 1, 8, 3.875, 31.0, 75, 3.700, 277.5),
(20, 1, 8, 3.500, 28.0, 15, 3.500, 28.0),
(21, 1, 8, 2.900, 23.2, 30, 2.900, 87.0),
(22, 1, 8, 3.200, 25.6, 30, 3.200, 96.0),
(23, 1, 8, 3.400, 27.2, 15, 3.400, 27.2),
(24, 1, 8, 2.000, 16.0, 30, 2.600, 78.0),
(25, 1, 8, 3.400, 27.2, 30, 3.400, 102.0);
-- 29. ACADEMIC WARNINGS (additional IDs 3-8)
INSERT INTO academic_warnings (student_id, warning_type, warning_level, reason, gpa_at_warning, semester_id, issued_by, status, created_at) VALUES
(13, 'low_gpa', 1, 'انخفاض المعدل التراكمي إلى 1.2', 1.20, 1, 1, 'active', '2025-12-15 10:00:00'),
(19, 'low_gpa', 1, 'رسوب في مادتين', 2.20, 1, 1, 'active', '2025-12-16 10:00:00'),
(15, 'attendance', 1, 'غياب متكرر بدون عذر', NULL, 1, 5, 'active', '2025-11-20 09:00:00'),
(13, 'attendance', 2, 'تجاوز نسبة الغياب 30%', NULL, 1, 5, 'active', '2025-12-01 09:00:00'),
(19, 'behavior', 1, 'سلوك غير لائق في الفصل', NULL, 1, 3, 'resolved', '2025-11-25 11:00:00'),
(15, 'low_gpa', 1, 'انخفاض المعدل إلى 2.4', 2.40, 1, 1, 'active', '2025-12-18 10:00:00');
-- 30. ACADEMIC CALENDAR (additional)
INSERT INTO academic_calendar (academic_semester_id, event_date, event_type, event_title, event_title_en, description, is_holiday) VALUES
(1, '2025-09-15', 'registration_end', 'آخر موعد للتسجيل', 'Last Registration Date', 'آخر موعد لتسجيل المواد الدراسية', false),
(1, '2025-10-15', 'event', 'اليوم المفتوح', 'Open Day', 'يوم مفتوح للزوار والطلاب الجدد', false),
(1, '2025-11-26', 'holiday', 'عيد الاستقلال', 'Independence Day', 'إجازة رسمية بمناسبة عيد الاستقلال', true),
(1, '2025-12-31', 'holiday', 'رأس السنة الميلادية', 'New Year', 'إجازة رأس السنة', true),
(1, '2026-01-05', 'exams_start', 'الامتحانات النهائية', 'Final Exams Start', 'بداية امتحانات نهاية الفصل الأول', false),
(1, '2026-01-15', 'exams_end', 'نهاية الامتحانات النهائية', 'Final Exams End', 'نهاية امتحانات نهاية الفصل الأول', false),
(2, '2026-02-01', 'classes_start', 'بداية الفصل الثاني', 'Spring Semester Start', 'بداية الفصل الدراسي الثاني', false),
(2, '2026-02-15', 'registration_end', 'آخر موعد للتسجيل - الفصل الثاني', 'Registration End Spring', 'آخر موعد لتسجيل المواد في الفصل الثاني', false),
(2, '2026-03-15', 'event', 'مؤتمر الهندسة', 'Engineering Conference', 'المؤتمر السنوي لكلية الهندسة', false),
(2, '2026-05-01', 'holiday', 'عيد العمال', 'Labor Day', 'إجازة عيد العمال', true);
-- 31. MESSAGES (additional)
INSERT INTO messages (sender_id, receiver_id, message_text, is_read, created_at) VALUES
(1, 3, 'يرجى إرسال جدول الامتحانات لهذا الفصل', true, '2025-10-05 09:00:00'),
(3, 1, 'تم إرسال الجدول بالبريد الإلكتروني', true, '2025-10-05 09:15:00'),
(1, 5, 'يرجى متابعة بلاغ الطالب رقم 2024005', true, '2025-10-10 10:00:00'),
(5, 1, 'تم متابعة البلاغ وجاري الحل', false, '2025-10-10 10:30:00'),
(2, 4, 'هل تم إضافة درجات الاختبار الت中期?', true, '2025-11-05 14:00:00'),
(4, 2, 'نعم، تم الإضافة عبر النظام', true, '2025-11-05 14:15:00'),
(1, 6, 'يرجى إعداد تقرير المدفوعات الشهرية', true, '2025-11-10 09:00:00'),
(6, 1, 'التقرير جاهز ومرفق', true, '2025-11-10 15:00:00'),
(7, 1, 'تم اكتشاف ثغرة أمنية في النظام', true, '2025-11-15 08:00:00'),
(1, 7, 'يرجى إصلاح المشكلة فوراً', true, '2025-11-15 08:15:00'),
(3, 1, 'الطلاب يطلبون تأجيل موعد الامتحان', false, '2025-11-20 10:00:00'),
(1, 4, 'يرجى مراجعة درجات الطلاب المتأخرة', false, '2025-11-25 09:00:00'),
(10, 1, 'السلام عليكم، أحتاج مساعدة في تسجيل المواد', true, '2025-11-27 11:00:00'),
(1, 10, 'وعليكم السلام، تفضل بالمجيء إلى مكتب شؤون الطلاب', true, '2025-11-27 11:30:00'),
(5, 2, 'تم حل مشكلة الشبكة في المعمل', false, '2025-11-28 14:00:00');
-- 32. NOTIFICATIONS (additional)
INSERT INTO notifications (recipient_type, recipient_id, title, body, channel, status, created_at) VALUES
('student', 3, 'تنبيه بالرسوم', 'لديك رسوم مستحقة بقيمة 300000 ريال', 'sms', 'sent', '2025-10-20 09:00:00'),
('student', 5, 'تأكيد التسجيل', 'تم تسجيلك في الفصل الأول بنجاح', 'email', 'sent', '2025-09-01 08:00:00'),
('student', 7, 'تنبيه أكاديمي', 'تنبيه: انخفاض المعدل التراكمي', 'push', 'sent', '2025-12-15 10:00:00'),
('student', 8, 'نتيجة امتحان', 'نتيجة امتحان منتصف الفصل: B+', 'email', 'sent', '2025-11-10 08:00:00'),
('student', 1, 'تذكير بموعد امتحان', 'امتحان قواعد البيانات: 2025-11-10 الساعة 10:00', 'push', 'sent', '2025-11-09 08:00:00'),
('student', 2, 'تذكير بموعد امتحان', 'امتحان قواعد البيانات: 2025-11-10 الساعة 10:00', 'email', 'sent', '2025-11-09 08:00:00'),
('employee', 3, 'تقرير الدرجات', 'يرجى إدخال درجات الطلاب قبل 2025-12-01', 'email', 'sent', '2025-11-20 09:00:00'),
('student', 13, 'تنبيه أكاديمي', 'أنت مهدد بالرسوب - يرجى تحسين درجاتك', 'sms', 'sent', '2025-12-01 09:00:00'),
('student', 19, 'تنبيه أكاديمي', 'رسوب في مادة - يرجى إعادة التسجيل', 'email', 'sent', '2025-12-16 10:00:00'),
('student', 15, 'تنبيه بالحضور', 'نسبة غيابك مرتفعة - يرجى الحضور düzenli', 'sms', 'sent', '2025-11-20 09:00:00'),
('student', 5, 'إشعار غرامة مكتبة', 'لديك غرامة مكتبة بقيمة 5000 ريال', 'push', 'sent', '2025-11-25 09:00:00');
-- 33. COURSE SYLLABI (additional IDs 3-8)
INSERT INTO course_syllabi (study_subject_id, objectives, learning_outcomes, teaching_methods, assessment_methods, "references", weekly_plan) VALUES
(3, 'تعليم الطلاب أساسيات تصميم وتطوير قواعد البيانات العلائقية', 'فهم مفاهيم قواعد البيانات وتصميمها وبرمجة SQL', 'محاضرات نظرية، تطبيقات عملية على SQL Server', 'امتحان 50%، واجبات 20%، مشروع 30%', '["Database System Concepts - Silberschatz"]', '[{"week":1,"topic":"مقدمة في قواعد البيانات"},{"week":2,"topic":"نموذج العلاقات"},{"week":3,"topic":"تصميم قواعد البيانات"},{"week":4,"topic":"SQL - الأساسيات"},{"week":5,"topic":"SQL - الاستعلامات المتقدمة"},{"week":6,"topic":"NORMALIZATION"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"الم事务ات"},{"week":9,"topic":"الفهارس"},{"week":10,"topic":"Views"},{"week":11,"topic":"Procedures و Functions"},{"week":12,"topic":"الأمان في قواعد البيانات"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]'),
(5, 'تعليم الطلاب مفاهيم شبكات الحاسوب والبروتوكولات', 'فهم نموذج OSI وTCP/IP وتصميم الشبكات', 'محاضرات نظرية، تطبيقات عملية في المعمل', 'امتحان 50%، شهادة عملية 30%، واجبات 20%', '["Computer Networking - Kurose"]', '[{"week":1,"topic":"مقدمة في الشبكات"},{"week":2,"topic":"نماذج الاتصال"},{"week":3,"topic":"طبقة Physical"},{"week":4,"topic":"طبقة Data Link"},{"week":5,"topic":"طبقة Network"},{"week":6,"topic":"طبقة Transport"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"طبقة Application"},{"week":9,"topic":"TCP/IP"},{"week":10,"topic":"تصميم الشبكات"},{"week":11,"topic":"أمن الشبكات"},{"week":12,"topic":"Wireless Networks"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]'),
(9, 'تعليم الطلاب مبادئ أمن المعلومات وحمايتها', 'فهم تهديدات الأمن وتقنيات الحماية', 'محاضرات نظرية، دراسات حالة، تطبيقات عملية', 'امتحان 40%، مشروع 40%، عرض تقديمي 20%', '["Cybersecurity Fundamentals"]', '[{"week":1,"topic":"مقدمة في أمن المعلومات"},{"week":2,"topic":"التهديدات الإلكترونية"},{"week":3,"topic":"التشفير"},{"week":4,"topic":"Firewall Networks"},{"week":5,"topic":"أنظمة كشف التسلل"},{"week":6,"topic":"الجدار الناري"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"أمن التطبيقات"},{"week":9,"topic":"اختبار الاختراق"},{"week":10,"topic":"إدارة المخاطر"},{"week":11,"topic":"الامتثال والمعايير"},{"week":12,"topic":"أمن السحابة"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]'),
(11, 'تعليم الطلاب أساسيات المحاسبة المالية وتحليل البيانات المالية', 'فهم القوائم المالية وتحليلها', 'محاضرات نظرية، تحليل حالات عملية', 'امتحان 50%، واجبات 20%، مشروع 30%', '["Financial Accounting - Weygandt"]', '[{"week":1,"topic":"مقدمة في المحاسبة"},{"week":2,"topic":"الميزانية العمومية"},{"week":3,"topic":"قائمة الدخل"},{"week":4,"topic":"التدفق النقدي"},{"week":5,"topic":"التحليل المالي"},{"week":6,"topic":"التكاليف"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"الموازنة"},{"week":9,"topic":"التخطيط المالي"},{"week":10,"topic":"الضرائب"},{"week":11,"topic":"المحاسبة الإدارية"},{"week":12,"topic":"دراسة حالة"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]'),
(13, 'تعليم الطلاب التشريح البشري والوظائف الحيوية', 'فهم هيكل الجسم البشري ووظائف أعضائه', 'محاضرات نظرية، دراسة في المعمل', 'امتحان 60%، تقرير معمل 20%، عرض 20%', '["Grays Anatomy"]', '[{"week":1,"topic":"مقدمة في التشريح"},{"week":2,"topic":"الجهاز الهيكلي"},{"week":3,"topic":"الجهاز العضلي"},{"week":4,"topic":"جهاز الدورة الدموية"},{"week":5,"topic":"جهاز التنفس"},{"week":6,"topic":"جهاز الهضم"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"جهاز البول"},{"week":9,"topic":"الجهاز العصبي"},{"week":10,"topic":"الجهاز الحسي"},{"week":11,"topic":"الغدد الصماء"},{"week":12,"topic":"الجهاز المناعي"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]'),
(15, 'تعليم الطلاب أساسيات الهندسة المدنية والتصميم', 'فهم مبادئ الهيكل والخرسانة', 'محاضرات نظرية، تطبيقات عملية، زيارات ميدانية', 'امتحان 50%، مشروع 30%، واجبات 20%', '["Civil Engineering Principles"]', '[{"week":1,"topic":"مقدمة في الهندسة المدنية"},{"week":2,"topic":"ميكانيكا المواد"},{"week":3,"topic":"خرسانة مسلحة"},{"week":4,"topic":"تصميم المنشآت"},{"week":5,"topic":"الأسمنت والركام"},{"week":6,"topic":"المحاجر والمناجم"},{"week":7,"topic":"امتحان منتصف الفصل"},{"week":8,"topic":"هندسة النقل"},{"week":9,"topic":"هندسة الموارد المائية"},{"week":10,"topic":"التربة والأساسات"},{"week":11,"topic":"إدارة المشاريع"},{"week":12,"topic":"دراسة حالة"},{"week":13,"topic":"مراجعة"},{"week":14,"topic":"امتحان نهائي"}]');
-- 34. DOCUMENTS (additional)
INSERT INTO documents (title, category_id, document_type, file_path, file_size, entity_type, entity_id, tags, is_confidential, version, uploaded_by) VALUES
('عقد توظيف - سارة عبدالله', 4, 'pdf', '/uploads/contracts/emp002.pdf', 280000, 'employee', 2, 'عقد,توظيف', false, 1, 1),
('السجل الأكاديمي - سارة محمد', 6, 'pdf', '/uploads/records/2024002.pdf', 195000, 'student', 2, 'سجل,أكاديمي', true, 1, 5),
('شهادة بكالوريوس - أحمد خالد', 5, 'pdf', '/uploads/certificates/ahmed.pdf', 320000, 'student', 1, 'شهادة', false, 1, 5),
('تقرير مالي نصف سنوي', 8, 'excel', '/uploads/reports/semi_annual.xlsx', 350000, 'general', NULL, 'تقرير,مالي', true, 1, 6),
('عقد مقاولات - أحمد محسن', 4, 'pdf', '/uploads/contracts/ctr001.pdf', 420000, 'contractor', 1, 'عقد,مقاولات', false, 1, 1),
('بوليصة تأمين الموظفين', 1, 'pdf', '/uploads/insurance/employees.pdf', 550000, 'general', NULL, 'تأمين', false, 1, 6),
('نظام الامتحانات الإلكتروني', 10, 'pdf', '/uploads/policies/exam_system.pdf', 280000, 'general', NULL, 'نظام,امتحانات', false, 3, 1),
('دليل الطالب الجديد', 2, 'pdf', '/uploads/manuals/new_student.pdf', 1200000, 'general', NULL, 'دليل,طالب', false, 1, 1),
('عقد مقاولات - وليد الحضرمي', 4, 'pdf', '/uploads/contracts/ctr002.pdf', 380000, 'contractor', 2, 'عقد,مقاولات', false, 1, 1);
-- 35. CONTRACTORS (additional IDs 4-8)
INSERT INTO contractors (full_name, full_name_en, identity_number, phone, email, contract_type, contract_number, start_date, end_date, contract_duration_months, salary_amount, allowances, total_amount, payment_frequency, bank_account, bank_name, college_id, department_id, supervisor_id, status, notify_before_expiry) VALUES
('م. عمر البكري', 'Omar Al-Bakri', '4234567890', '779456700', 'omar.b@contractor.com', 'part_time', 'CTR-2025-004', '2025-09-01', '2026-06-30', 10, 180000, 20000, 200000, 'monthly', 'SA0077777777', 'البنك الأهلي', 2, 4, 3, 'active', 30),
('د. مها العتيبي', 'Maha Al-Otaibi', '5234567890', '770567800', 'maha.o@contractor.com', 'semester', 'CTR-2025-005', '2025-09-01', '2026-01-15', 4, 220000, 30000, 250000, 'monthly', 'SA0088888888', 'بنك التسليف', 2, 4, 11, 'active', 15),
('م. عبدالرحمن الفهد', 'Abdulrahman Al-Fahd', '6234567890', '771678900', 'abdulrahman.f@contractor.com', 'project_based', 'CTR-2025-006', '2025-10-01', '2026-03-31', 6, 350000, 50000, 400000, 'lump_sum', 'SA0099999999', 'البنك اليمني', 1, 3, 2, 'active', 30),
('د. ريم السالم', 'Reem Al-Salem', '7234567890', '772789000', 'reem.s@contractor.com', 'full_time', 'CTR-2025-007', '2025-09-01', '2026-08-31', 12, 300000, 40000, 340000, 'monthly', 'SA0100000000', 'البنك الأهلي', 2, 5, 4, 'active', 30),
('م. أحمد الصقر', 'Ahmed Al-Saqr', '8234567890', '773890100', 'ahmed.sa@contractor.com', 'part_time', 'CTR-2025-008', '2025-09-01', '2026-06-30', 10, 160000, 15000, 175000, 'monthly', 'SA0111111111', 'بنك التسليف', 1, 1, 1, 'expired', 15);
-- 36. CONTRACTOR DOCUMENTS (additional)
INSERT INTO contractor_documents (contractor_id, document_type, document_name, file_path, issue_date, expiry_date, is_verified, notes) VALUES
(4, 'contract', 'عقد تدريس جزئي', '/uploads/contractors/ctr004_contract.pdf', '2025-08-25', '2026-06-30', true, 'عقد محاضر جزئي'),
(4, 'certificate', 'شهادة ماجستير', '/uploads/contractors/ctr004_master.pdf', '2019-06-15', NULL, true, NULL),
(5, 'contract', 'عقد تدريس فصلي', '/uploads/contractors/ctr005_contract.pdf', '2025-08-20', '2026-01-15', true, NULL),
(5, 'passport', 'صورة جواز سفر', '/uploads/contractors/ctr005_passport.pdf', '2022-01-01', '2027-01-01', true, NULL),
(6, 'contract', 'عقد مشاريع', '/uploads/contractors/ctr006_contract.pdf', '2025-09-25', '2026-03-31', true, 'مشروع تطوير'),
(7, 'contract', 'عقد توظيف كامل', '/uploads/contractors/ctr007_contract.pdf', '2025-08-25', '2026-08-31', true, NULL),
(8, 'contract', 'عقد منتهي', '/uploads/contractors/ctr008_contract.pdf', '2024-09-01', '2025-06-30', true, 'العقد منتهي');
-- 37. TICKETS (additional)
INSERT INTO tickets (title, description, created_by, assigned_to, status) VALUES
('مشكلة في تسجيل الدخول', 'عدم القدرة على تسجيل الدخول للنظام', 10, 7, 'open'),
('طلب تحديث بيانات الطالب', 'تحديث بيانات الطالب 2024005', 5, 7, 'closed'),
('مشكلة في عرض الدرجات', 'النظام لا يعرض درجات بعض الطلاب', 4, 7, 'open'),
('استفسار عن الرسوم', 'استفسار عن الرسوم الدراسية', 20, 6, 'closed'),
('طلب إضافة مادة جديدة', 'إضافة مادة تعلم الآلة إلى النظام', 3, 7, 'in_progress'),
('مشكلة في الطابعة', 'الطابعة في المعمل لا تعمل', 1, 8, 'completed');
-- 38. CHATBOT TRAINING (additional)
INSERT INTO chatbot_training (question, intent, sql_query, expected_response) VALUES
('ما هو المعدل التراكمي للطالب أحمد؟', 'student_gpa', 'SELECT cumulative_gpa FROM students WHERE full_name LIKE ''%أحمد%''', 'المعدل التراكمي للطالب أحمد هو'),
('كم عدد الكليات؟', 'college_count', 'SELECT COUNT(*) FROM colleges', 'عدد الكليات هو'),
('ما هي المواد المتاحة هذا الفصل؟', 'subjects_list', 'SELECT subject_name FROM study_subjects WHERE academic_semester_id = 1', 'المواد المتاحة هذا الفصل هي'),
('كم عدد الموظفين النشطين؟', 'active_employees', 'SELECT COUNT(*) FROM employees WHERE status = ''active''', 'عدد الموظفين النشطين هو'),
('ما هي أيام الدوام؟', 'work_days', 'SELECT * FROM time_slots WHERE is_active = true', 'أيام الدوام حسب الجدول هي');
-- 39. QUESTION TEMPLATES (additional)
INSERT INTO question_templates (template_text, intent, category) VALUES
('كم عدد الموظفين في {department}؟', 'count', 'إحصائيات'),
('ما هو جدول {entity}؟', 'schedule', 'جداول'),
('ما هي نتائج {entity}؟', 'results', 'نتائج'),
('أين يقع {entity}؟', 'location', 'مواقع'),
('متى يبدأ {entity}؟', 'date', 'تواريخ');
-- 40. TRAINING QUESTIONS (additional)
INSERT INTO training_questions (question, intent, category) VALUES
('كم عدد الموظفين؟', 'employee_count', 'إحصائيات'),
('ما هو نظام الدرجات؟', 'grading_system', 'أكاديمي'),
('كيف أسجل في المواد؟', 'registration', 'إجراءات'),
('ما هي ساعات الدوام؟', 'work_hours', 'معلومات'),
('أين تقع المكتبة؟', 'library_location', 'مواقع'),
('كيف أستعير كتاباً؟', 'borrow_book', 'إجراءات');
-- 41. SYSTEM LOGS (additional)
INSERT INTO system_logs (user_name, action, details, ip_address, created_at) VALUES
('محمد منير', 'تسجيل دخول', 'تم تسجيل الدخول إلى النظام', '192.168.1.105', '2025-10-01 08:00:00'),
('محمد منير', 'إضافة طالب', 'تم إضافة الطالب وليد أحمد', '192.168.1.105', '2025-10-01 09:15:00'),
('سارة علي', 'تعديل جدول', 'تم تعديل الجدول الدراسي', '192.168.1.101', '2025-10-05 10:00:00'),
('محمد حسن', 'إدخال درجات', 'تم إدخال درجات الاختبار', '192.168.1.102', '2025-11-06 14:00:00'),
('فاطمة أحمد', 'إدخال درجات', 'تم إدخال درجات الاختبار', '192.168.1.103', '2025-11-06 15:00:00'),
('نورة عبدالله', 'تسجيل دفعة', 'تم تسجيل 5 دفعات رسوم', '192.168.1.104', '2025-11-10 11:00:00'),
('علي صالح', 'تحديث النظام', 'تم تحديث النظام إلى الإصدار 2.0', '192.168.1.106', '2025-11-15 08:00:00'),
('مريم حسين', 'صيانة', 'تم صيانة أجهزة المعمل', '192.168.1.107', '2025-11-17 09:00:00'),
('محمد منير', 'إعداد مستخدم', 'تم إعداد صلاحيات محمد منير', '192.168.1.105', '2025-11-20 10:00:00'),
('أحمد محمد', 'نسخ احتياطي', 'تم عمل نسخة احتياطية من قاعدة البيانات', '192.168.1.100', '2025-11-25 08:00:00');
COMMIT;
