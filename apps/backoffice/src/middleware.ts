import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { removeCookie } from '@test-pod/auth-shared'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(cookieName)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', authUrl))
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    const { roles } = payload as { roles: string[] }

    if (!roles.includes('admin')) {
      return NextResponse.redirect(new URL('/access-denied', authUrl))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.redirect(new URL('/login', authUrl))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*'],
}
