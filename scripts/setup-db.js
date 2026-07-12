const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function runFile(filePath, label) {
  console.log(`Running ${label}...`)
  const sql = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8')
  
  try {
    await pool.query(sql)
    console.log(`✓ ${label} completed`)
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
      console.log(`⚠ ${label}: skipping existing data...`)
    } else {
      console.error(`✗ ${label} failed:`, err.message)
      throw err
    }
  }
}

async function main() {
  console.log('Connecting to Neon PostgreSQL...')
  const client = await pool.connect()
  
  try {
    console.log('✓ Connected to database\n')

    console.log('Dropping all existing tables...')
    await pool.query(`
      DO $$ DECLARE r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `)
    console.log('✓ All tables dropped\n')

    await runFile('setup-database.sql', 'Base Tables')
    await runFile('migration.sql', 'Migration Tables')
    await runFile('seed-data.sql', 'Seed Data')

    console.log('\n✓ Database setup complete!')
    
    const res = await pool.query('SELECT COUNT(*) FROM users')
    console.log(`  Users: ${res.rows[0].count}`)
    
    const res2 = await pool.query('SELECT COUNT(*) FROM students')
    console.log(`  Students: ${res2.rows[0].count}`)
    
    const res3 = await pool.query('SELECT COUNT(*) FROM employees')
    console.log(`  Employees: ${res3.rows[0].count}`)
    
    const res4 = await pool.query('SELECT COUNT(*) FROM study_subjects')
    console.log(`  Subjects: ${res4.rows[0].count}`)

    const res5 = await pool.query('SELECT email FROM users LIMIT 3')
    console.log(`  Sample users: ${res5.rows.map(r => r.email).join(', ')}`)
  } catch (err) {
    console.error('\n✗ Setup failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
