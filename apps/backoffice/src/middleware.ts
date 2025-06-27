import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { navItems } from './app/dashboard/menu-items'
import type { NavItem } from './app/dashboard/menu-items'
import { userHasPermission } from '@test-pod/auth-shared'
import type { SessionUser } from '@test-pod/database'

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

export async function redirectMiddleware(
  token: string | undefined,
  secret: string,
  authUrl: string,
  pathname: string
): Promise<{ redirect: boolean; destination: URL | undefined }> {
  const secretBuffer = new TextEncoder().encode(secret)

  if (!token) {
    return {
      redirect: true,
      destination: new URL('/login', authUrl),
    }
  }

  try {
    const { payload } = await jwtVerify(token, secretBuffer)

    const { roles } = payload as unknown as SessionUser

    if (!roles?.includes('admin')) {
      return {
        redirect: true,
        destination: new URL('/access-denied', authUrl),
      }
    }

    const allowedPermissions = navItems.find((item: NavItem) => item.href === pathname)?.permissions
    const hasPermission = userHasPermission(
      payload as unknown as SessionUser,
      allowedPermissions || []
    )

    if (!hasPermission) {
      return {
        redirect: true,
        destination: new URL('/access-denied', authUrl),
      }
    }

    return {
      redirect: false,
      destination: undefined,
    }
  } catch (_error) {
    return {
      redirect: true,
      destination: new URL('/login', authUrl),
    }
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*'],
}
