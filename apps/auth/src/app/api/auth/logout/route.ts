import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'

    const response = await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.cookies.get('authToken') && {
          Cookie: `authToken=${request.cookies.get('authToken')?.value}`,
        }),
      },
    })

    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost'

    if (response.ok) {
      const nextResponse = NextResponse.redirect(authUrl)

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
    } else {
      const nextResponse = NextResponse.json(
        { error: 'Erro no logout' },
        { status: response.status }
      )

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
  } catch (error) {
    console.error('Error in logout API route:', error)
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'

    const nextResponse = NextResponse.redirect(authUrl)

    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
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
}
