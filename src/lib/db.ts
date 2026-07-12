import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function query(text: string, params?: unknown[]) {
  const result = await sql(text, params)
  return { rows: result }
}
