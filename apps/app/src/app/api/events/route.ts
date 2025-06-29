import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const active = searchParams.get('active')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const backendParams = new URLSearchParams()
    if (name) {
      backendParams.append('name', name)
    }
    if (fromDate) {
      backendParams.append('fromDate', fromDate)
    }
    if (toDate) {
      backendParams.append('toDate', toDate)
    }
    if (active) {
      backendParams.append('active', active)
    }
    if (limit) {
      backendParams.append('limit', limit)
    }
    if (offset) {
      backendParams.append('offset', offset)
    }

    const queryString = backendParams.toString()
    const url = `${API_URL}/api/events${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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
          { error: text || 'Failed to fetch events' },
          { status: response.status }
        )
      }
    }

    const events = await response.json()
    return NextResponse.json(events)
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    const data = await request.json()

    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
          { error: text || 'Failed to create event' },
          { status: response.status }
        )
      }
    }

    const event = await response.json()
    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
  }
}
