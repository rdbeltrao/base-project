import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const nextResponse = NextResponse.json(data)

    if (data?.token) {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost'
      const isProduction = process.env.NODE_ENV === 'production'

      nextResponse.cookies.set({
        name: cookieName,
        value: data.token,
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        domain: cookieDomain,
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Error in register API route:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
