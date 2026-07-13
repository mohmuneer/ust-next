const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('Dropping all tables...');
  const dropResult = await pool.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
  console.log('  All tables dropped.');

  console.log('\n1/3 Creating base tables...');
  const setup = fs.readFileSync(path.join(__dirname, '..', 'setup-database.sql'), 'utf-8');
  try {
    await pool.query(setup);
    console.log('  OK');
  } catch (e) {
    console.error(`  Error: ${e.message.substring(0, 200)}`);
  }

  console.log('\n2/3 Creating additional tables...');
  const migration = fs.readFileSync(path.join(__dirname, '..', 'migration.sql'), 'utf-8');
  try {
    await pool.query(migration);
    console.log('  OK');
  } catch (e) {
    console.error(`  Error: ${e.message.substring(0, 200)}`);
  }

  console.log('\n3/3 Seeding data...');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'seed-data.sql'), 'utf-8');
  try {
    await pool.query(seed);
    console.log('  OK');
  } catch (e) {
    console.error(`  Error: ${e.message.substring(0, 200)}`);
  }

  console.log('\nVerifying...');
  const tables = await pool.query("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(`  Tables: ${tables.rows[0].cnt}`);
  const users = await pool.query('SELECT COUNT(*) as cnt FROM users');
  console.log(`  Users: ${users.rows[0].cnt}`);
  const students = await pool.query('SELECT COUNT(*) as cnt FROM students');
  console.log(`  Students: ${students.rows[0].cnt}`);
  const employees = await pool.query('SELECT COUNT(*) as cnt FROM employees');
  console.log(`  Employees: ${employees.rows[0].cnt}`);
  const subjects = await pool.query('SELECT COUNT(*) as cnt FROM study_subjects');
  console.log(`  Subjects: ${subjects.rows[0].cnt}`);

  await pool.end();
  console.log('\nDone!');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
