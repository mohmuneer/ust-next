-- =============================================
-- كلية العلوم الإدارية - المستوى الرابع - الفصل الثاني 2025-2026
-- =============================================

-- 1. مجموعات دراسة
INSERT INTO study_groups (group_name, group_type, college_id) VALUES
('A', 'regular', 4),
('B', 'regular', 4);

-- 2. مواد المستوى الرابع - إدارة الأعمال
INSERT INTO study_subjects (subject_name, subject_code, college_id, department_id, study_level_id, study_group_id, academic_semester_id, weekly_hours) VALUES
('إدارة استراتيجية متقدمة', 'BAD401', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة التغيير والتحول organizational', 'BAD402', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('ريادة الأعمال المتقدمة', 'BAD403', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة الأزمات والكوارث', 'BAD404', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع تخرج إداري', 'BAD405', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 4),
('أخلاقيات الأعمال والمسؤولية المجتمعية', 'BAD406', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - إدارة الأعمال (المجموعة B)
('إدارة استراتيجية متقدمة', 'BAD401', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة التغيير والتحول', 'BAD402', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('ريادة الأعمال المتقدمة', 'BAD403', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة الأزمات والكوارث', 'BAD404', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع تخرج إداري', 'BAD405', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 4),
('أخلاقيات الأعمال والمسؤولية المجتمعية', 'BAD406', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - المحاسبة
('التدقيق والمراجعة الداخلية', 'ACC401', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('المحاسبة الضريبية المتقدمة', 'ACC402', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('المحاسبة والإدارة الحكومية', 'ACC403', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('نظم المعلومات المحاسبية', 'ACC404', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع تخرج محاسبي', 'ACC405', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 4),
('معايير المحاسبة الدولية', 'ACC406', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - المحاسبة (المجموعة B)
('التدقيق والمراجعة الداخلية', 'ACC401', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('المحاسبة الضريبية المتقدمة', 'ACC402', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('المحاسبة والإدارة الحكومية', 'ACC403', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 3),
('نظم المعلومات المحاسبية', 'ACC404', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع تخرج محاسبي', 'ACC405', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 4),
('معايير المحاسبة الدولية', 'ACC406', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - الاقتصاد
('الاقتصاد الكلي المتقدم', 'ECO401', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('الاقتصاد النقدي والمالي', 'ECO402', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('السياسات الاقتصادية والتنمية', 'ECO403', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('الاقتصاد الدولي المتقدم', 'ECO404', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع اقتصادي', 'ECO405', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 4),
('النماذج الاقتصادية القياسية', 'ECO406', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - الموارد البشرية
('التخطيط الاستراتيجي للموارد البشرية', 'HRM401', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة الأداء والكفاءات', 'HRM402', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('تفاوض وعلاقات العمل', 'HRM403', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('قانون العمل والتأمينات الاجتماعية', 'HRM404', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع موارد بشرية', 'HRM405', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 4),
('تنمية وتطوير الموارد البشرية', 'HRM406', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),

-- مواد المستوى الرابع - التسويق
('التسويق الاستراتيجي', 'MKT401', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('إدارة العلامات التجارية', 'MKT402', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('بحوث التسويق المتقدمة', 'MKT403', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 3),
('التسويق الدولي', 'MKT404', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2),
('مشروع تسويقي', 'MKT405', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 4),
('التسويق الرقمي المتقدم', 'MKT406', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 2);

-- 3. جدول دراسي - الفصل الثاني 2025-2026
-- إدارة أعمال - المجموعة A
INSERT INTO study_schedules (college_id, academic_semester_id, day_of_week, start_time, end_time, study_subject_id, employee_id, study_group_id, study_level_id, room, notes) VALUES
-- السبت
(4, 2, 'Saturday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A301', 'إدارة استراتيجية'),
(4, 2, 'Saturday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A301', 'ريادة أعمال'),
-- الأحد
(4, 2, 'Sunday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A302', 'إدارة التغيير'),
(4, 2, 'Sunday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A302', 'أخلاقيات الأعمال'),
-- الاثنين
(4, 2, 'Monday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A303', 'إدارة الأزمات'),
(4, 2, 'Monday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'A303', 'مشروع تخرج'),

-- إدارة أعمال - المجموعة B
(4, 2, 'Saturday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A304', 'إدارة استراتيجية'),
(4, 2, 'Saturday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A304', 'ريادة أعمال'),
(4, 2, 'Sunday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A305', 'إدارة التغيير'),
(4, 2, 'Sunday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A305', 'أخلاقيات الأعمال'),
(4, 2, 'Monday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A306', 'إدارة الأزمات'),
(4, 2, 'Monday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'BAD405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'A306', 'مشروع تخرج'),

-- محاسبة - المجموعة A
(4, 2, 'Tuesday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B201', 'تدقيق ومراجعة'),
(4, 2, 'Tuesday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B201', 'محاسبة ضريبية'),
(4, 2, 'Wednesday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B202', 'محاسبة حكومية'),
(4, 2, 'Wednesday', '10:00', '11:30', (SELECT id FROM study_subjects WHERE subject_code = 'ACC404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B202', 'نظم محاسبية'),
(4, 2, 'Thursday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B201', 'معايير دولية'),
(4, 2, 'Thursday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'B201', 'مشروع تخرج'),

-- محاسبة - المجموعة B
(4, 2, 'Tuesday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B203', 'تدقيق ومراجعة'),
(4, 2, 'Tuesday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B203', 'محاسبة ضريبية'),
(4, 2, 'Wednesday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B204', 'محاسبة حكومية'),
(4, 2, 'Wednesday', '10:00', '11:30', (SELECT id FROM study_subjects WHERE subject_code = 'ACC404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B204', 'نظم محاسبية'),
(4, 2, 'Thursday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 11, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B203', 'معايير دولية'),
(4, 2, 'Thursday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'ACC405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 4, 'B203', 'مشروع تخرج'),

-- اقتصاد - المجموعة A
(4, 2, 'Saturday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'ECO401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C101', 'اقتصاد كلي'),
(4, 2, 'Saturday', '15:00', '17:00', (SELECT id FROM study_subjects WHERE subject_code = 'ECO402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C101', 'اقتصاد نقدي'),
(4, 2, 'Sunday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'ECO403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C102', 'سياسات اقتصادية'),
(4, 2, 'Sunday', '15:00', '16:30', (SELECT id FROM study_subjects WHERE subject_code = 'ECO404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C102', 'اقتصاد دولي'),
(4, 2, 'Tuesday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'ECO406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C101', 'نماذج قياسية'),
(4, 2, 'Tuesday', '15:00', '17:00', (SELECT id FROM study_subjects WHERE subject_code = 'ECO405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'C101', 'مشروع اقتصادي'),

-- موارد بشرية - المجموعة A
(4, 2, 'Monday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'HRM401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D101', 'تخطيط استراتيجي'),
(4, 2, 'Monday', '15:00', '17:00', (SELECT id FROM study_subjects WHERE subject_code = 'HRM402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D101', 'إدارة الأداء'),
(4, 2, 'Wednesday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'HRM403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D102', 'تفاوض وعلاقات عمل'),
(4, 2, 'Wednesday', '15:00', '16:30', (SELECT id FROM study_subjects WHERE subject_code = 'HRM404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D102', 'قانون العمل'),
(4, 2, 'Thursday', '13:00', '15:00', (SELECT id FROM study_subjects WHERE subject_code = 'HRM406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 6, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D101', 'تطوير الموارد'),
(4, 2, 'Thursday', '15:00', '17:00', (SELECT id FROM study_subjects WHERE subject_code = 'HRM405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 13, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'D101', 'مشروع موارد'),

-- تسويق - المجموعة A
(4, 2, 'Saturday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'MKT401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E101', 'تسويق استراتيجي'),
(4, 2, 'Saturday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'MKT402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E101', 'علامات تجارية'),
(4, 2, 'Tuesday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'MKT403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E102', 'بحوث تسويقية'),
(4, 2, 'Tuesday', '10:00', '11:30', (SELECT id FROM study_subjects WHERE subject_code = 'MKT404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E102', 'تسويق دولي'),
(4, 2, 'Thursday', '08:00', '10:00', (SELECT id FROM study_subjects WHERE subject_code = 'MKT406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 14, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E101', 'تسويق رقمي'),
(4, 2, 'Thursday', '10:00', '12:00', (SELECT id FROM study_subjects WHERE subject_code = 'MKT405' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 15, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 4, 'E101', 'مشروع تسويقي');

-- 4. طلاب المستوى الرابع - كلية العلوم الإدارية
INSERT INTO students (student_number, full_name, email, phone, college_id, department_id, study_level_id, study_group_id, academic_semester_id, status, total_earned_hours, total_gpa_points, cumulative_gpa, academic_status, enrollment_date, expected_graduation_date, nationality, birth_date, gender, address, password) VALUES
-- إدارة أعمال - المجموعة A
('2022043', 'عمر عبدالله الشميري', 'omar.shamiri@stu.ust.edu.ye', '731111111', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 248.4, 3.45, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-05-20', 'ذكر', 'صنعاء', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022044', 'منال حسين الجوفي', 'manal.joufi@stu.ust.edu.ye', '731111112', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 259.2, 3.60, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-08-14', 'أنثى', 'عدن', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022045', 'سعود أحمد المقطري', 'saud.moqatri@stu.ust.edu.ye', '731111113', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 70, 227.5, 3.25, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-01-03', 'ذكر', 'تعز', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- إدارة أعمال - المجموعة B
('2022046', 'رنا خالد العرشي', 'rana.arshy@stu.ust.edu.ye', '731111114', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 'active', 72, 252.0, 3.50, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-11-22', 'أنثى', 'إب', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022047', 'بلال يوسف الحمادي', 'belal.hammadi@stu.ust.edu.ye', '731111115', 4, 98, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 'active', 71, 238.8, 3.36, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-07-09', 'ذكر', 'ذمار', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- محاسبة - المجموعة A
('2022053', 'هناء عبدالرحمن البحيري', 'hana.bahri@stu.ust.edu.ye', '731111116', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 262.8, 3.65, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-03-18', 'أنثى', 'صنعاء', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022054', 'ماجد سالم الدوسري', 'majed.dawsari@stu.ust.edu.ye', '731111117', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 244.8, 3.40, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-12-05', 'ذكر', 'لحج', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- محاسبة - المجموعة B
('2022055', 'أمل محمد العقيلي', 'amal.aqeeli@stu.ust.edu.ye', '731111118', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 'active', 71, 237.7, 3.35, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2002-04-11', 'أنثى', 'صنعاء', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022056', 'فؤاد عبدالعزيز النعماني', 'fuad.naumani@stu.ust.edu.ye', '731111119', 4, 99, 4, (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1), 2, 'active', 72, 255.6, 3.55, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-09-28', 'ذكر', 'حجة', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- اقتصاد - المجموعة A
('2022063', 'ياسمين عبدالكريم الصايغ', 'yasmine.sayegh@stu.ust.edu.ye', '731111120', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 259.2, 3.60, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-06-17', 'أنثى', 'عدن', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022064', 'عصام حسين القحطاني', 'essam.qahtani@stu.ust.edu.ye', '731111121', 4, 100, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 241.2, 3.35, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-02-14', 'ذكر', 'صنعاء', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- موارد بشرية - المجموعة A
('2022073', 'نادية أحمد الملا', 'nadia.milla@stu.ust.edu.ye', '731111122', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 266.4, 3.70, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-10-03', 'أنثى', 'تعز', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022074', 'محمد عبدالولي الشرفي', 'mohammed.sharafi@stu.ust.edu.ye', '731111123', 4, 101, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 237.6, 3.30, 'active', '2022-09-01', '2026-06-15', 'يمني', '2002-05-25', 'ذكر', 'إب', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
-- تسويق - المجموعة A
('2022083', 'سلمى عادل العولقي', 'salma.awlaqi@stu.ust.edu.ye', '731111124', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 255.6, 3.55, 'active', '2022-09-01', '2026-06-15', 'يمنية', '2001-04-08', 'أنثى', 'صنعاء', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2022084', 'حاتم عبدالفتاح السماعيلي', 'hatem.semaili@stu.ust.edu.ye', '731111125', 4, 102, 4, (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1), 2, 'active', 72, 244.8, 3.40, 'active', '2022-09-01', '2026-06-15', 'يمني', '2001-08-30', 'ذكر', 'المهرة', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- 5. سجلات الدرجات - الفصل الثاني 2025-2026
INSERT INTO academic_records (student_id, study_subject_id, grade_letter, grade_numeric, grade_points, is_pass, academic_semester_id) VALUES
-- عمر الشميري - إدارة أعمال A
((SELECT id FROM students WHERE student_number = '2022043' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 88, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022043' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 85, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022043' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 92, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022043' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 80, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022043' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD406' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 86, 3.3, true, 2),
-- منال الجوفي - إدارة أعمال A
((SELECT id FROM students WHERE student_number = '2022044' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 93, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022044' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 89, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022044' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 85, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022044' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 87, 3.7, true, 2),
-- سعود المقطري - إدارة أعمال A
((SELECT id FROM students WHERE student_number = '2022045' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 80, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022045' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'C+', 75, 2.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022045' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 84, 3.3, true, 2),
-- رنا العرشي - إدارة أعمال B
((SELECT id FROM students WHERE student_number = '2022046' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 91, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022046' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 86, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022046' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'BAD403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 88, 3.7, true, 2),
-- هناء البحيري - محاسبة A
((SELECT id FROM students WHERE student_number = '2022053' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 95, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022053' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 90, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022053' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 93, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022053' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC404' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 87, 3.3, true, 2),
-- ماجد الدوسري - محاسبة A
((SELECT id FROM students WHERE student_number = '2022054' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 86, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022054' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 82, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022054' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 85, 3.3, true, 2),
-- أمل العقيلي - محاسبة B
((SELECT id FROM students WHERE student_number = '2022055' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 81, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022055' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'C+', 76, 2.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022055' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ACC403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'B' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 84, 3.3, true, 2),
-- ياسمين الصايغ - اقتصاد A
((SELECT id FROM students WHERE student_number = '2022063' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 94, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022063' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 89, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022063' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 85, 3.3, true, 2),
-- عصام القحطاني - اقتصاد A
((SELECT id FROM students WHERE student_number = '2022064' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 86, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022064' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 82, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022064' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'ECO403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 88, 3.7, true, 2),
-- نادية الملا - موارد بشرية A
((SELECT id FROM students WHERE student_number = '2022073' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'HRM401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 96, 4.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022073' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'HRM402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 91, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022073' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'HRM403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 93, 4.0, true, 2),
-- سلمى العولقي - تسويق A
((SELECT id FROM students WHERE student_number = '2022083' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A-', 89, 3.7, true, 2),
((SELECT id FROM students WHERE student_number = '2022083' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 85, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022083' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'A', 92, 4.0, true, 2),
-- حاتم السماعيلي - تسويق A
((SELECT id FROM students WHERE student_number = '2022084' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT401' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 83, 3.0, true, 2),
((SELECT id FROM students WHERE student_number = '2022084' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT402' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B+', 86, 3.3, true, 2),
((SELECT id FROM students WHERE student_number = '2022084' LIMIT 1), (SELECT id FROM study_subjects WHERE subject_code = 'MKT403' AND study_group_id = (SELECT id FROM study_groups WHERE group_name = 'A' AND college_id = 4 LIMIT 1) LIMIT 1), 'B', 81, 3.0, true, 2);

-- 6. تقويم أكاديمي - الفصل الثاني 2025-2026
INSERT INTO academic_calendar (event_title, description, event_date, event_type, academic_semester_id) VALUES
('بداية التسجيل - الفصل الثاني', 'فترة تسجيل المواد الدراسية للفصل الثاني', '2026-01-26', 'academic', 2),
('بداية المحاضرات - الفصل الثاني', 'بداية الدوام الدراسي للفصل الثاني', '2026-02-01', 'academic', 2),
('عطلة العيد', 'عطلة عيد الفطر المبارك', '2026-03-20', 'holiday', 2),
('اختبارات منتصف الفصل الثاني', 'اختبارات النصف للفصل الثاني', '2026-03-15', 'exam', 2),
('نهاية المحاضرات - الفصل الثاني', 'نهاية الدوام الدراسي للفصل الثاني', '2026-05-20', 'academic', 2),
('اختبارات نهاية الفصل الثاني', 'الاختبارات النهائية للفصل الثاني', '2026-05-25', 'exam', 2);
