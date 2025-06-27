import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const COOKIE_NAME = process.env.COOKIE_NAME || 'authToken'

export async function GET(_request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch users' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in users API route:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to create user' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in users API route:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
