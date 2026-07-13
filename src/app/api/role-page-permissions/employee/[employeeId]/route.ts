import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params
    const result = await query(
      `SELECT
        rpm.page_key,
        rpm.can_view,
        rpm.can_add,
        rpm.can_edit,
        rpm.can_delete
      FROM role_page_permissions rpm
      INNER JOIN employee_permissions ep ON ep.role_id = rpm.role_id
      WHERE ep.employee_id = $1`,
      [Number(employeeId)]
    )

    const perms: Record<string, { can_view: boolean; can_add: boolean; can_edit: boolean; can_delete: boolean }> = {}
    for (const row of result.rows) {
      perms[row.page_key] = {
        can_view: row.can_view,
        can_add: row.can_add,
        can_edit: row.can_edit,
        can_delete: row.can_delete,
      }
    }

    return NextResponse.json(perms)
  } catch (error) {
    console.error('Error fetching employee permissions:', error)
    return NextResponse.json({})
  }
}
