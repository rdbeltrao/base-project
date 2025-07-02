import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function POST(_request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    })

    const nextResponse = NextResponse.json(
      response.ok ? { success: true } : { error: 'Erro no logout' },
      { status: response.status }
    )

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
  } catch (error) {
    console.error('Error in logout API route:', error)

    const nextResponse = NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })

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
