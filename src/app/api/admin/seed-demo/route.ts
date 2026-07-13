import { NextResponse } from 'next/server'
import { getSql } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

export const maxDuration = 60

export async function POST() {
  try {
    const sqlPath = join(process.cwd(), 'seed-enhancement.sql')
    const raw = readFileSync(sqlPath, 'utf-8')

    const lines = raw.split('\n')
    const cleaned: string[] = []
    let inComment = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('/*')) inComment = true
      if (inComment) {
        if (trimmed.includes('*/')) inComment = false
        continue
      }
      if (trimmed.startsWith('--') || trimmed.length === 0) continue
      cleaned.push(line)
    }

    const sql = cleaned.join('\n')

    const neonSql = await getSql()
    const result = await neonSql.query(sql)

    const rows = Array.isArray(result) ? result : [result]
    const lastRow = rows[rows.length - 1] as Record<string, unknown> | undefined

    return NextResponse.json({
      ok: true,
      message: 'تم تعبئة البيانات التجريبية بنجاح',
      total_lines: cleaned.length,
      result_rows: rows.length,
      last_command_tag: lastRow?.commandTag ?? null,
    })
  } catch (error) {
    console.error('Seed demo error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
