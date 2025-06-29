import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const COOKIE_NAME = process.env.COOKIE_NAME || 'authToken'
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    console.log('API recebeu parâmetros de filtro:', { startDate, endDate })

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    let url = `${backendUrl}/api/stats/dashboard`

    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`
      console.log('URL do backend com filtros:', url)
    } else {
      console.log('Nenhum filtro aplicado, URL do backend:', url)
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}