import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.COOKIE_NAME || 'authToken'

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    // Extrair parâmetros de filtro da URL
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const active = searchParams.get('active')

    // Construir query string para o backend
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

    const queryString = backendParams.toString()
    const url = `${API_URL}/api/events${queryString ? `?${queryString}` : ''}`

    // Buscar eventos através da API do backend
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const events = await response.json()

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const data = await request.json()

    // Criar evento através da API do backend
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const event = await response.json()

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
