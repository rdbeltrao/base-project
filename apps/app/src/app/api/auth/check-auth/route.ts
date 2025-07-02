import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(_request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    const response = await fetch(`${API_URL}/api/auth/check-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const responseClone = response.clone()

      try {
        const errorData = await response.json()
        return NextResponse.json(errorData, { status: response.status })
      } catch (_error) {
        const text = await responseClone.text()
        return NextResponse.json(
          { error: text || 'Erro ao verificar autenticação' },
          { status: response.status }
        )
      }
    }

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error in check-auth API route:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
