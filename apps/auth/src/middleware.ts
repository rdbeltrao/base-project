import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(cookieName)?.value
  const redirectResult = await redirectMiddleware(
    token,
    req.nextUrl.pathname,
    req.url,
    process.env.JWT_SECRET || 'your-secret-key'
  )
  if (redirectResult.redirect && redirectResult.destination) {
    return NextResponse.redirect(redirectResult.destination)
  }

  return NextResponse.next()
}

export async function redirectMiddleware(
  token: string | undefined,
  path: string,
  url: string,
  secret: string
): Promise<{ redirect: boolean; destination: URL | undefined }> {
  const secretBuffer = new TextEncoder().encode(secret)

  if (path.startsWith('/login')) {
    if (token) {
      return {
        redirect: true,
        destination: new URL('/dashboard', url),
      }
    }
    return {
      redirect: false,
      destination: undefined,
    }
  }

  if (path.startsWith('/dashboard')) {
    if (!token) {
      return {
        redirect: true,
        destination: new URL('/login', url),
      }
    }
    try {
      await jwtVerify(token, secretBuffer)
      return {
        redirect: false,
        destination: undefined,
      }
    } catch (_error) {
      return {
        redirect: true,
        destination: new URL('/login', url),
      }
    }
  }
  return {
    redirect: false,
    destination: undefined,
  }
}

export const config = {
  exclude: ['/access-denied'],
}
