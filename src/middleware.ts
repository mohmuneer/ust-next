import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ust-next-dev-secret-only-for-local-development'
)

const publicPaths = ['/login', '/employee-login', '/student-login', '/student/login']
const publicApiPaths = ['/api/auth/']

type UserType = 'student' | 'employee' | 'user'

const routeRoles: Record<string, UserType[]> = {
  '/student': ['student'],
  '/dashboard': ['employee', 'user'],
  '/employees': ['employee', 'user'],
  '/students': ['employee', 'user'],
  '/lectures': ['employee', 'user'],
  '/colleges': ['employee', 'user'],
  '/departments': ['employee', 'user'],
  '/courses': ['employee', 'user'],
  '/grades': ['employee', 'user'],
  '/attendance': ['employee', 'user'],
  '/schedule': ['employee', 'user'],
  '/semesters': ['employee', 'user'],
  '/academic': ['employee', 'user'],
  '/settings': ['employee', 'user'],
  '/reports': ['employee', 'user'],
  '/roles': ['employee', 'user'],
  '/permissions': ['employee', 'user'],
}

function getRequiredRoles(pathname: string): UserType[] | null {
  for (const [prefix, roles] of Object.entries(routeRoles)) {
    if (pathname.startsWith(prefix)) return roles
  }
  return null
}

async function verifyTokenFromRequest(request: NextRequest): Promise<{ valid: boolean; type?: UserType }> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (payload.type && ['student', 'employee', 'user'].includes(payload.type as string)) {
        return { valid: true, type: payload.type as UserType }
      }
    } catch { /* invalid */ }
  }

  const cookies = request.cookies

  const cookieMap: Record<string, UserType> = {
    student_token: 'student',
    employee_token: 'employee',
    auth_token: 'user',
  }

  for (const [cookieName, userType] of Object.entries(cookieMap)) {
    const token = cookies.get(cookieName)?.value
    if (!token) continue

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (payload.type === userType) {
        return { valid: true, type: userType }
      }
    } catch {
      continue
    }
  }

  return { valid: false }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (publicApiPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const auth = await verifyTokenFromRequest(request)

  if (!auth.valid) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'غير مصرح بالدخول', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    let loginPath = '/login'
    if (pathname.startsWith('/student')) {
      loginPath = '/student/login'
    } else {
      loginPath = '/employee-login'
    }
    const loginUrl = new URL(loginPath, request.url)
    return NextResponse.redirect(loginUrl)
  }

  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles && auth.type && !requiredRoles.includes(auth.type)) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية للوصول لهذا المورد', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const fallbackUrl = auth.type === 'student'
      ? new URL('/student/dashboard', request.url)
      : new URL('/dashboard', request.url)
    return NextResponse.redirect(fallbackUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ust-logo.png|uploads|icons|manifest).*)'],
}
