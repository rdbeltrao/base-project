import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params

    console.log(`Fetching event details from: ${API_URL}/api/events/${id}`)

    // Buscar evento através da API do backend
    const response = await fetch(`${API_URL}/api/events/${id}`, {
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
          { error: text || 'Failed to fetch event' },
          { status: response.status }
        )
      }
    }

    const event = await response.json()
    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params
    const data = await request.json()

    // Atualizar evento através da API do backend
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {
            'Content-Type': 'application/json',
          },
      body: JSON.stringify(data),
    })

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
          { error: text || 'Failed to update event' },
          { status: response.status }
        )
      }
    }

    const event = await response.json()
    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params

    // Excluir evento através da API do backend
    const response = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {
            'Content-Type': 'application/json',
          },
    })

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
          { error: text || 'Failed to delete event' },
          { status: response.status }
        )
      }
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 })
  }
}
