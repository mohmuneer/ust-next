import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function query(text: string, params?: unknown[]) {
  const sql = getSql()
  const rows = await sql.query(text, params ?? [])
  return { rows }
}

export default { query }
