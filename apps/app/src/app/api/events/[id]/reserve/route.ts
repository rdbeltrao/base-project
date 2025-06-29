import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params

    const url = `${API_URL}/api/events/${id}/reserve`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const responseClone = response.clone()

      try {
        const errorData = await response.json()
        return NextResponse.json(errorData, { status: response.status })
      } catch (_error) {
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
