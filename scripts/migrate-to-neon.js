const { Pool } = require('pg');

const SOURCE = { host: 'localhost', port: 5432, database: 'ustproject', user: 'postgres', password: '' };
const TARGET_URL = 'postgresql://neondb_owner:npg_d5tUa3FZlVoT@ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';

const src = new Pool(SOURCE);
const tgt = new Pool({ connectionString: TARGET_URL, ssl: { rejectUnauthorized: false } });

async function getTables(pool) {
  const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  return r.rows.map(r => r.tablename);
}

async function getColumns(pool, table) {
  const r = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position
  `, [table]);
  return r.rows.map(r => r.column_name);
}

async function transferTable(table) {
  const cols = await getColumns(src, table);
  const countR = await src.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
  const count = parseInt(countR.rows[0].cnt);
  if (count === 0) return { table, rows: 0 };

  const colList = cols.map(c => `"${c}"`).join(', ');
  let total = 0;
  const batchSize = 500;

  for (let offset = 0; offset < count; offset += batchSize) {
    const rows = await src.query(`SELECT * FROM "${table}" ORDER BY 1 OFFSET $1 LIMIT $2`, [offset, batchSize]);
    if (rows.rows.length === 0) break;

    const valueChunks = [];
    const allValues = [];
    let paramIdx = 1;

    for (const row of rows.rows) {
      const placeholders = cols.map(c => {
        let v = row[c];
        if (v === null || v === undefined) {
          allValues.push(null);
        } else if (v instanceof Date) {
          allValues.push(v.toISOString());
        } else if (typeof v === 'object') {
          allValues.push(JSON.stringify(v));
        } else {
          allValues.push(String(v));
        }
        return `$${paramIdx++}`;
      });
      valueChunks.push(`(${placeholders.join(',')})`);
    }

    const sql = `INSERT INTO "${table}" (${colList}) VALUES ${valueChunks.join(',')} ON CONFLICT DO NOTHING`;
    try {
      const r = await tgt.query(sql, allValues);
      total += r.rowCount;
    } catch (e) {
      if (e.message && !e.message.includes('duplicate')) {
        console.error(`    ! ${table}: ${e.message.substring(0, 120)}`);
      }
    }
  }

  return { table, rows: total };
}

async function main() {
  // First, drop all tables in Neon and recreate from local schema
  console.log('Reading local schema...');
  const localTables = await getTables(src);
  console.log(`Found ${localTables.length} tables in local DB.\n`);

  console.log('Dropping all Neon tables...');
  await tgt.query(`
    DO $$ DECLARE r RECORD; BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  console.log('Creating tables from local schema...');
  const schemaR = await src.query(`
    SELECT table_name, column_name, data_type, character_maximum_length,
           is_nullable, column_default, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const tableSchemas = {};
  for (const row of schemaR.rows) {
    if (!tableSchemas[row.table_name]) tableSchemas[row.table_name] = [];
    tableSchemas[row.table_name].push(row);
  }

  // Get primary keys
  const pkR = await src.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `);
  const pks = {};
  for (const row of pkR.rows) {
    if (!pks[row.table_name]) pks[row.table_name] = [];
    pks[row.table_name].push(row.column_name);
  }

  // Get foreign keys
  const fkR = await src.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);
  const fks = {};
  for (const row of fkR.rows) {
    if (!fks[row.table_name]) fks[row.table_name] = [];
    fks[row.table_name].push(row);
  }

  // Get unique constraints
  const uqR = await src.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `);
  const uqs = {};
  for (const row of uqR.rows) {
    if (!uqs[row.table_name]) uqs[row.table_name] = [];
    uqs[row.table_name].push(row.column_name);
  }

  for (const [table, columns] of Object.entries(tableSchemas)) {
    const colDefs = columns.map(c => {
      let def = `"${c.column_name}" `;
      
      if (c.data_type === 'character varying' || c.data_type === 'varchar') {
        def += c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR(255)';
      } else if (c.data_type === 'character') {
        def += `CHAR(${c.character_maximum_length || 1})`;
      } else if (c.data_type === 'integer' && c.column_default && c.column_default.includes('nextval')) {
        def += 'SERIAL';
      } else if (c.data_type === 'bigint' && c.column_default && c.column_default.includes('nextval')) {
        def += 'BIGSERIAL';
      } else if (c.data_type === 'ARRAY') {
        def += `${c.udt_name}`;
      } else if (c.data_type === 'USER-DEFINED') {
        def += `${c.udt_name}`;
      } else {
        def += c.data_type.toUpperCase();
      }

      if (c.is_nullable === 'NO' && !def.includes('SERIAL')) {
        def += ' NOT NULL';
      }
      if (c.column_default && !c.column_default.includes('nextval')) {
        def += ` DEFAULT ${c.column_default}`;
      }
      return def;
    });

    const pkCols = pks[table] || [];
    if (pkCols.length > 0 && !columns.some(c => c.column_default && c.column_default.includes('nextval'))) {
      // no auto-increment PK, add it as regular column
    }

    const createSql = `CREATE TABLE IF NOT EXISTS "${table}" (${colDefs.join(', ')})`;
    try {
      await tgt.query(createSql);
    } catch (e) {
      console.error(`  ! Create ${table}: ${e.message.substring(0, 100)}`);
    }
  }

  console.log(`Created ${Object.keys(tableSchemas).length} tables.\n`);

  // Transfer data
  console.log('Transferring data...');
  let totalRows = 0;
  for (const table of localTables) {
    const r = await transferTable(table);
    totalRows += r.rows;
    if (r.rows > 0) {
      console.log(`  + ${table}: ${r.rows} rows`);
    }
  }

  // Verify
  console.log('\nVerifying Neon database...');
  const vTables = await tgt.query("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public'");
  const vUsers = await tgt.query('SELECT COUNT(*) as cnt FROM users').catch(() => ({ rows: [{ cnt: 0 }] }));
  const vStudents = await tgt.query('SELECT COUNT(*) as cnt FROM students').catch(() => ({ rows: [{ cnt: 0 }] }));

  console.log(`  Tables: ${vTables.rows[0].cnt}`);
  console.log(`  Users: ${vUsers.rows[0].cnt}`);
  console.log(`  Students: ${vStudents.rows[0].cnt}`);
  console.log(`  Total rows transferred: ${totalRows}`);

  await src.end();
  await tgt.end();
  console.log('\nMigration complete!');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
