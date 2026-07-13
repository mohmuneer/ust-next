import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    const results: string[] = []
    const sqlPath = join(process.cwd(), 'seed-enhancement.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (const stmt of statements) {
      try {
        const upper = stmt.toUpperCase().trim()
        if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
          await query(stmt)
          results.push(`TX: ${upper}`)
          continue
        }
        const r = await query(stmt)
        const rowCount = (r as { rowCount?: number }).rowCount ?? 0
        if (upper.startsWith('INSERT')) {
          results.push(`INSERT: ${rowCount} rows`)
          successCount++
        } else if (upper.startsWith('UPDATE')) {
          results.push(`UPDATE: ${rowCount} rows`)
          successCount++
        } else {
          results.push(`OK: ${upper.substring(0, 50)}`)
          successCount++
        }
      } catch (e: unknown) {
        const msg = String(e)
        if (msg.includes('duplicate key') || msg.includes('already exists')) {
          results.push(`SKIP (dup): ${stmt.substring(0, 60)}`)
        } else {
          results.push(`ERROR: ${msg.substring(0, 120)} | STMT: ${stmt.substring(0, 60)}`)
          errorCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تعبئة البيانات التجريبية بنجاح',
      statements_total: statements.length,
      success: successCount,
      errors: errorCount,
      details: results.slice(0, 50),
    })
  } catch (error) {
    console.error('Seed demo error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
