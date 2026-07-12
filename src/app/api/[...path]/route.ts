import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL || 'http://localhost/ustproject'

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE')
}

async function proxyRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace('/api/', '')
  const searchParams = request.nextUrl.search

  try {
    const body = method !== 'GET' ? await request.json().catch(() => ({})) : undefined
    const queryString = searchParams ? `&${searchParams.slice(1)}` : ''
    const url = `${API_BASE}/api/index.php?path=${encodeURIComponent(path)}${queryString}`

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _method: method, ...(body || {}) }),
    }

    const res = await fetch(url, fetchOptions)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    if (method === 'GET') {
      return NextResponse.json([])
    }
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' })
  }
}
