'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatDate } from '@test-pod/utils'

interface ChartDataPoint {
  date: string
  eventNames: string
  totalSpots: number
  reservedSpots: number
}

interface DashboardStats {
  chartData: ChartDataPoint[]
  summary: {
    totalSpots: number
    totalReserved: number
  }
}

interface DashboardChartProps {
  startDate?: string
  endDate?: string
}

export default function DashboardChart({ startDate, endDate }: DashboardChartProps = {}) {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ((startDate && endDate) || (!startDate && !endDate)) {
      fetchData(startDate, endDate)
    }
  }, [startDate, endDate])

  const fetchData = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      let url = '/api/stats/dashboard'
      const params = new URLSearchParams()

      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white p-3 border rounded shadow-lg'>
          <p className='font-semibold'>{data.eventNames}</p>
          <p className='text-sm text-gray-600'>{formatDate(new Date(data.date))}</p>
          <p className='text-blue-600'>
            Vagas Totais: <span className='font-semibold'>{data.totalSpots}</span>
          </p>
          <p className='text-green-600'>
            Vagas Reservadas: <span className='font-semibold'>{data.reservedSpots}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>Carregando dados...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-red-500'>Erro: {error}</div>
      </div>
    )
  }

  if (!data || data.chartData.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>Nenhum dado encontrado para o período selecionado</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Cards de Resumo */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <h3 className='text-lg font-semibold text-blue-800'>Total de Vagas</h3>
          <p className='text-2xl font-bold text-blue-600'>{data.summary.totalSpots}</p>
        </div>
        <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
          <h3 className='text-lg font-semibold text-green-800'>Vagas Reservadas</h3>
          <p className='text-2xl font-bold text-green-600'>{data.summary.totalReserved}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className='bg-white p-6 rounded-lg border'>
        <h3 className='text-lg font-semibold mb-4'>Vagas por Data</h3>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={formatDate}
              angle={-45}
              textAnchor='end'
              height={60}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey='totalSpots' fill='#3B82F6' name='Vagas Totais' />
            <Bar dataKey='reservedSpots' fill='#10B981' name='Vagas Reservadas' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
