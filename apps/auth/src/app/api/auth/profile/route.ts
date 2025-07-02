import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const authHeader = request.headers.get('authorization')

    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const authHeader = request.headers.get('authorization')

    // Fazer requisição para o backend principal
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

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
