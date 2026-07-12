const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_d5tUa3FZlVoT@ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const bcrypt = require('bcryptjs');

async function main() {
  try {
    const rows = await sql.query(
      `SELECT id, full_name, email, password, status FROM users WHERE email = $1 LIMIT 1`,
      ['admin@ust.edu.ye']
    );
    const user = rows[0];
    console.log('Found user:', user.email);
    console.log('Hash:', user.password);
    const valid = await bcrypt.compare('12345678', user.password);
    console.log('Password valid:', valid);
    console.log('Status:', user.status);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
