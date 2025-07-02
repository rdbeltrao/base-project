import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    const response = await fetch(`${apiUrl}/api/auth/google/callback?code=${code}&state=${state}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
    }

    const data = await response.json()
    const token = data.token

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
    const callbackUrl = `${authUrl}/auth/google/callback?token=${token}`
    const redirectResponse = NextResponse.redirect(callbackUrl)

    const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
    const isProduction = process.env.NODE_ENV === 'production'

    let cookieOptions = `${cookieName}=${token}; Path=/; SameSite=Lax; HttpOnly=false`

    if (isProduction) {
      cookieOptions += '; Secure'
    }

    if (cookieDomain) {
      cookieOptions += `; Domain=${cookieDomain}`
    }

    redirectResponse.headers.set('Set-Cookie', cookieOptions)

    return redirectResponse
  } catch (error) {
    console.error('Erro no callback do Google:', error)
    return NextResponse.redirect(new URL('/login?error=internal_error', request.url))
  }
}
