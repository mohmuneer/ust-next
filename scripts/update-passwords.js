const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const hash = bcrypt.hashSync('12345678', 10);
  
  await pool.query('UPDATE users SET password = $1', [hash]);
  console.log('All users password updated to 12345678');

  const verify = await pool.query('SELECT email, full_name FROM users');
  for (const u of verify.rows) {
    const r = await pool.query('SELECT password FROM users WHERE email = $1', [u.email]);
    const ok = bcrypt.compareSync('12345678', r.rows[0].password);
    console.log(`  ${u.email} (${u.full_name}) - ${ok ? 'OK' : 'FAILED'}`);
  }

  await pool.end();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
