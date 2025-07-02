import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(_request: NextRequest) {
  try {
    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

    const token = cookies().get(cookieName)?.value

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 })
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const nextResponse = NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      )

      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost'

      nextResponse.cookies.set({
        name: cookieName,
        value: '',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: cookieDomain,
        maxAge: 0,
      })

      return nextResponse
    }

    const data = await response.json()

    return NextResponse.json({
      isAuthenticated: true,
      user: data.user,
      token: token,
    })
  } catch (error) {
    console.error('Error in session API route:', error)
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 500 })
  }
}
