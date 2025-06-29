'use client'

import { useState } from 'react'
import DashboardChart from '../../components/dashboard-chart'
import DateFilter from '../../components/date-filter'

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  })

  const handleDateFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate })
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>

      <DateFilter onFilterChange={handleDateFilterChange} />

      <DashboardChart startDate={dateFilter.startDate} endDate={dateFilter.endDate} />
    </div>
  )
}
