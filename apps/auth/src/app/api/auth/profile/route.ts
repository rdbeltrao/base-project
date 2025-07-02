import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(_request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    const response = await fetch(`${apiUrl}/api/auth/check-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error in profile GET API route:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const token = cookies().get(COOKIE_NAME)?.value

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const responseClone = response.clone()

      try {
        const errorData = await response.json()
        return NextResponse.json(errorData, { status: response.status })
      } catch (_error) {
        const text = await responseClone.text()
        return NextResponse.json(
          { error: text || 'Erro ao atualizar perfil' },
          { status: response.status }
        )
      }
    }

    const data = await response.json()

    // Criar resposta com os dados do backend
    const nextResponse = NextResponse.json(data)

    // Se o backend retornou um token atualizado, definir o cookie
    if (data?.token) {
      const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
      const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost'
      const isProduction = process.env.NODE_ENV === 'production'

      nextResponse.cookies.set({
        name: cookieName,
        value: data.token,
        httpOnly: false, // Permitir acesso via JavaScript
        secure: isProduction, // HTTPS apenas em produção
        sameSite: 'lax',
        path: '/',
        domain: cookieDomain,
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Error in profile PUT API route:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
