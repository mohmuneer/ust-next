import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
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

    const fullSql = cleaned.join('\n')

    const statements: string[] = []
    let current = ''

    for (const line of cleaned) {
      current += line + '\n'
      if (line.trim().endsWith(';')) {
        const stmt = current.trim()
        if (stmt.length > 0) statements.push(stmt)
        current = ''
      }
    }
    if (current.trim().length > 0) statements.push(current.trim())

    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const stmt of statements) {
      try {
        const upper = stmt.toUpperCase().trim()
        if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
          await query(stmt)
          successCount++
          continue
        }
        await query(stmt)
        successCount++
      } catch (e: unknown) {
        const msg = String(e)
        if (msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('violates unique')) {
          skipCount++
        } else {
          errorCount++
          if (errors.length < 20) errors.push(msg.substring(0, 200) + ' | ' + stmt.substring(0, 80))
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'تم تعبئة البيانات التجريبية بنجاح',
      statements_total: statements.length,
      success_count: successCount,
      skipped: skipCount,
      errors: errorCount,
      error_details: errors,
    })
  } catch (error) {
    console.error('Seed demo error:', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    )
  }
}
