import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let client: any = null
  try {
    const body = await request.json().catch(() => ({}))
    const fileName = body.file || 'seed-enhancement.sql'
    const sqlPath = join(process.cwd(), fileName)
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

    const { Client } = await import('pg')
    client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()

    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const stmt of statements) {
      try {
        await client.query(stmt)
        successCount++
      } catch (e: any) {
        const msg = String(e?.message || e)
        if (msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('violates unique constraint')) {
          skipCount++
        } else {
          errorCount++
          if (errors.length < 20) errors.push(msg.substring(0, 200) + ' | ' + stmt.substring(0, 100))
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `تم تعبئة بيانات ${fileName} بنجاح`,
      file: fileName,
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
  } finally {
    if (client) {
      await client.end().catch(() => {})
    }
  }
}
