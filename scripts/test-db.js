const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_d5tUa3FZlVoT@ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  try {
    const r = await pool.query('SELECT id, email, full_name, password, status FROM users');
    console.log('Users:', JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
