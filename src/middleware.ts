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
    let loginPath = '/login'
    if (pathname.startsWith('/student')) {
      loginPath = '/student/login'
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/employees') || pathname.startsWith('/students') || pathname.startsWith('/lectures') || pathname.startsWith('/messages') || pathname.startsWith('/reports') || pathname.startsWith('/settings') || pathname.startsWith('/colleges') || pathname.startsWith('/departments') || pathname.startsWith('/courses') || pathname.startsWith('/grades') || pathname.startsWith('/attendance') || pathname.startsWith('/schedule') || pathname.startsWith('/semesters') || pathname.startsWith('/academic')) {
      loginPath = '/employee-login'
    }
    const loginUrl = new URL(loginPath, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ust-logo.png|uploads).*)'],
}
