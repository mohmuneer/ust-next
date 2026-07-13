require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  // 1. Check existing users and their role assignments
  const users = await sql`SELECT id, full_name, email, status FROM users ORDER BY id`;
  console.log('=== USERS ===');
  for (const u of users) {
    console.log(`  id=${u.id} name=${u.full_name} email=${u.email} status=${u.status}`);
  }

  // 2. Check roles
  const roles = await sql`SELECT id, role_name, role_code FROM roles ORDER BY id`;
  console.log('\n=== ROLES ===');
  for (const r of roles) {
    console.log(`  id=${r.id} name=${r.role_name} code=${r.role_code}`);
  }

  // 3. Check user-permission assignments
  const userPerms = await sql`SELECT * FROM user_permision ORDER BY user_id`;
  console.log('\n=== USER PERMISSION ASSIGNMENTS ===');
  for (const up of userPerms) {
    console.log(`  user_id=${up.user_id} role_id=${up.role_id}`);
  }

  // 4. Check role_page_permissions count
  const rpc = await sql`SELECT role_id, COUNT(*)::int AS count FROM role_page_permissions GROUP BY role_id`;
  console.log('\n=== ROLE PAGE PERMISSIONS ===');
  for (const r of rpc) {
    console.log(`  role_id=${r.role_id} permissions=${r.count}`);
  }

  // 5. Check user_page_access
  const upa = await sql`SELECT * FROM user_page_access LIMIT 10`;
  console.log('\n=== USER PAGE ACCESS ===');
  for (const u of upa) {
    console.log(`  `, JSON.stringify(u));
  }
})();
