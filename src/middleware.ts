import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/employee-login', '/student-login', '/student/login', '/api']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const hasAuthToken = request.cookies.has('auth_token')
  const hasEmployeeToken = request.cookies.has('employee_token')
  const hasStudentToken = request.cookies.has('student_token')

  if (!hasAuthToken && !hasEmployeeToken && !hasStudentToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ust-logo.png|uploads).*)'],
}
