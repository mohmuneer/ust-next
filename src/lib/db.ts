/* eslint-disable @typescript-eslint/no-explicit-any */
let cachedSql: any = null

export async function getSql() {
  if (cachedSql) return cachedSql
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const { neon } = await import('@neondatabase/serverless')
  cachedSql = neon(url)
  return cachedSql
}

export async function query(text: string, params?: unknown[]) {
  const sql = await getSql()
  const rows = await sql.query(text, params ?? [])
  return { rows }
}

export default { query }
