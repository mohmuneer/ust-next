const {neon} = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_d5tUa3FZlVoT@ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  try {
    const r = await sql.query('SELECT email, full_name FROM users WHERE email = $1', ['admin@ust.edu.ye']);
    console.log('type:', typeof r);
    console.log('keys:', Object.keys(r));
    console.log('full result:', JSON.stringify(r, null, 2));
  } catch (e) {
    console.error('error:', e.message);
  }
}
main();
