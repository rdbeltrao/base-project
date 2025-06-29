import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { searchParams } = new URL(request.url)
    
    const queryParams = new URLSearchParams()
    
    const status = searchParams.get('status')
    if (status) {
      queryParams.append('status', status)
    }

    const url = `${API_URL}/api/reservations/mine${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
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
          { error: text || 'Failed to fetch reservations' },
          { status: response.status }
        )
      }
    }

    const reservations = await response.json()
    return NextResponse.json(reservations)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}