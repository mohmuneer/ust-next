import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function query(text: string, params?: unknown[]) {
  const rows = await sql.query(text, params ?? [])
  return { rows }
}

export default { query }
