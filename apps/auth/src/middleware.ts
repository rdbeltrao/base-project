// middleware.ts  – coloque na raiz do projeto ou em src/
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || 'auth-token'
  const hasSession = request.cookies.get(cookieName)?.value

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
