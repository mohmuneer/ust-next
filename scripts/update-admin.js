const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const hash = bcrypt.hashSync('12345678', 10);
    console.log('Generated hash:', hash);

    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, full_name',
      [hash, 'admin@ust.edu.ye']
    );
    console.log('Updated:', JSON.stringify(result.rows, null, 2));

    const verify = await pool.query(
      'SELECT email, password FROM users WHERE email = $1',
      ['admin@ust.edu.ye']
    );
    const user = verify.rows[0];
    console.log('Verify login:', bcrypt.compareSync('12345678', user.password));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
