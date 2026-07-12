import { NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost/ustproject'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats.php`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      total_requests: 0,
      total_users: 0,
      total_branches: 0,
      total_colleges: 0,
      pending_tasks: 0,
      processing_tasks: 0,
      completed_tasks: 0,
      completion_rate: 0,
      priority_distribution: [],
      status_distribution: [],
      monthly_trends: [],
      branch_user_distribution: [],
      recent_requests: [],
    })
  }
}
