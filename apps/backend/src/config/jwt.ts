import jwt, { SignOptions } from 'jsonwebtoken'
import type { SessionUser } from '@test-pod/database'

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'

export const generateToken = (user: SessionUser): string => {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

export const verifyToken = (token: string): SessionUser => {
  return jwt.verify(token, JWT_SECRET) as SessionUser
}

export const setCookieHeader = (res: any, token: string): void => {
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const isProduction = process.env.NODE_ENV === 'production'

  let cookieOptions = `${cookieName}=${token}; Path=/; SameSite=Lax; HttpOnly=false; Max-Age=604800`

  if (isProduction) {
    cookieOptions += '; Secure'
  }

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions += `; Domain=${cookieDomain}`
  }

  res.setHeader('Set-Cookie', cookieOptions)
}

export const clearCookieHeader = (res: any): void => {
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const isProduction = process.env.NODE_ENV === 'production'

  let cookieOptions = `${cookieName}=; Path=/; SameSite=Lax; HttpOnly=true; Expires=Thu, 01 Jan 1970 00:00:00 GMT`

  if (isProduction) {
    cookieOptions += '; Secure'
  }

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions += `; Domain=${cookieDomain}`
  }

  res.setHeader('Set-Cookie', cookieOptions)
}

export const extractTokenFromCookies = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return null
  }

  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === cookieName) {
      return value
    }
  }

  return null
}