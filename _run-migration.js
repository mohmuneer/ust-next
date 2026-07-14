const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_d5tUa3FZlVoT@ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' });

(async () => {
  await client.connect();
  
  await client.query(`
    DROP TABLE IF EXISTS exam_assignments;
    CREATE TABLE exam_assignments (
      id SERIAL PRIMARY KEY,
      exam_id INTEGER NOT NULL,
      college_id INTEGER,
      department_id INTEGER,
      study_level_id INTEGER,
      study_group_id INTEGER,
      academic_semester_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_ea_exam ON exam_assignments(exam_id);
    CREATE INDEX idx_ea_college ON exam_assignments(college_id);
    CREATE INDEX idx_ea_dept ON exam_assignments(department_id);
  `);
  console.log('exam_assignments created!');
  
  const r = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exam_assignments' ORDER BY ordinal_position");
  console.log('Columns:', r.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));
  
  // Verify exams PK exists
  const pk = await client.query("SELECT conname FROM pg_constraint WHERE conrelid = 'exams'::regclass AND contype = 'p'");
  console.log('Exams PK:', pk.rows.length > 0 ? pk.rows[0].conname : 'NONE');
  
  await client.end();
})().catch(e => { console.error(e); process.exit(1); });
