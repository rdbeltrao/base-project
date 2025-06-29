import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.COOKIE_NAME || 'authToken'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const eventId = params.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const backendParams = new URLSearchParams()
    if (status) {
      backendParams.append('status', status)
    }

    const queryString = backendParams.toString()
    const url = `${API_URL}/api/events/${eventId}/reservations${queryString ? `?${queryString}` : ''}`

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

    const reservations = await response.json()
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}
