import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.COOKIE_NAME || 'authToken'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const reservationId = params.id

    const response = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const reservation = await response.json()
    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 })
  }
}
