import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

export async function PUT(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    const { id } = params

    const url = `${API_URL}/api/reservations/${id}/confirm`

    const response = await fetch(url, {
      method: 'PUT',
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
          { error: text || 'Failed to confirm reservation' },
          { status: response.status }
        )
      }
    }

    const reservation = await response.json()
    return NextResponse.json(reservation)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to confirm reservation' },
      { status: 500 }
    )
  }
}
