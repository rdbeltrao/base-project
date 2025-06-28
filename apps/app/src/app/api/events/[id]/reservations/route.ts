import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params

    console.log(`Fetching event reservations from: ${API_URL}/api/events/${id}/reservations`)

    // Buscar reservas do evento através da API do backend
    const response = await fetch(`${API_URL}/api/events/${id}/reservations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      // Primeiro clone a resposta para poder ler o corpo mais de uma vez se necessário
      const responseClone = response.clone()

      try {
        const errorData = await response.json()
        return NextResponse.json(errorData, { status: response.status })
      } catch (_error) {
        // Se não conseguir ler como JSON, tenta ler como texto
        const text = await responseClone.text()
        return NextResponse.json(
          { error: text || 'Failed to fetch event reservations' },
          { status: response.status }
        )
      }
    }

    const reservations = await response.json()
    return NextResponse.json(reservations)
  } catch (error: any) {
    console.error('Error fetching event reservations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event reservations' },
      { status: 500 }
    )
  }
}
