import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/events/public`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Falha ao buscar eventos em destaque')
    }

    const events = await response.json()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Erro ao buscar eventos em destaque:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar eventos em destaque' },
      { status: 500 }
    )
  }
}
