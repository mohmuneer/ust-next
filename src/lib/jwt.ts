import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set in environment variables!')
}

const SECRET = JWT_SECRET || 'ust-next-dev-secret-only-for-local-development'

export interface JWTPayload {
  id: number
  type: 'student' | 'employee' | 'user'
  [key: string]: unknown
}

export function signToken(payload: JWTPayload, expiresIn = '24h'): string {
  return jwt.sign(payload, SECRET, { expiresIn: expiresIn as any })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | null
  } catch {
    return null
  }
}
