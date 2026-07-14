CREATE TABLE IF NOT EXISTS exam_assignments (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  study_level_id INTEGER REFERENCES study_levels(id) ON DELETE SET NULL,
  study_group_id INTEGER REFERENCES study_groups(id) ON DELETE SET NULL,
  academic_semester_id INTEGER REFERENCES academic_semesters(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exam_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_college ON exam_assignments(college_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_dept ON exam_assignments(department_id);
