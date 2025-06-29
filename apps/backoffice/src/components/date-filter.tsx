'use client'

import { useState } from 'react'
import { formatDate } from '@test-pod/utils'

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      onFilterChange(startDate, endDate)
    }
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    onFilterChange('', '')
  }

  const today = formatDate(new Date())

  return (
    <div className='bg-white p-4 rounded-lg border space-y-4'>
      <h3 className='text-lg font-semibold'>Filtrar por Data</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 mb-1'>
            Data de Início
          </label>
          <input
            type='date'
            id='startDate'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <div>
          <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 mb-1'>
            Data de Fim
          </label>
          <input
            type='date'
            id='endDate'
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate}
            max={today}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      <div className='flex gap-2'>
        <button
          onClick={handleApplyFilter}
          disabled={!startDate || !endDate}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
        >
          Aplicar Filtro
        </button>

        <button
          onClick={handleClearFilter}
          className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
        >
          Limpar Filtro
        </button>
      </div>

      {startDate && endDate && (
        <div className='text-sm text-gray-600'>
          Período selecionado: {formatDate(new Date(startDate))} até {formatDate(new Date(endDate))}
        </div>
      )}
    </div>
  )
}
