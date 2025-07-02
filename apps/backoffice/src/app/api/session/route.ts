import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'auth-token'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        token: null,
      })
    }

    // Validar token com o backend
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Token inválido, limpar cookie
      const responseWithClearedCookie = NextResponse.json({
        isAuthenticated: false,
        user: null,
        token: null,
      })

      responseWithClearedCookie.cookies.set(COOKIE_NAME, '', {
        expires: new Date(0),
        path: '/',
      })

      return responseWithClearedCookie
    }

    const data = await response.json()

    return NextResponse.json({
      isAuthenticated: true,
      user: data.user,
      token: token,
    })
  } catch (error) {
    console.error('Session validation error:', error)

    const responseWithClearedCookie = NextResponse.json({
      isAuthenticated: false,
      user: null,
      token: null,
    })

    responseWithClearedCookie.cookies.set(COOKIE_NAME, '', {
      expires: new Date(0),
      path: '/',
    })

    return responseWithClearedCookie
  }
}
