import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { redirectMiddleware } from './redirect-middleware'

const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(cookieName)?.value
  const redirectResult = await redirectMiddleware(
    token,
    process.env.JWT_SECRET || 'your-secret-key',
    authUrl,
    req.nextUrl.pathname
  )

  if (redirectResult.redirect && redirectResult.destination) {
    return NextResponse.redirect(redirectResult.destination)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
