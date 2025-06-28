'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Input } from './input'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DateTimePicker({ value, onChange, disabled = false, className }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)

  const dateValue = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : ''

  React.useEffect(() => {
    if (value === undefined && date !== undefined) {
      // Se o valor externo for undefined, limpar o estado interno
      setDate(undefined)
    } else if (value && (!date || value.getTime() !== date.getTime())) {
      // Se houver um valor externo, atualizar o estado interno
      setDate(value)
    }
  }, [value, date])

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value
    if (!dateString) {
      setDate(undefined)
      if (onChange) onChange(undefined)
      return
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number)
      const newDate = new Date(year, month - 1, day, 12, 0, 0)
      setDate(newDate)
      if (onChange) onChange(newDate)
    } catch (error) {
      console.error('Erro ao converter data:', error)
    }
  }

  return (
    <Input
      type='date'
      value={dateValue}
      onChange={handleDateChange}
      disabled={disabled}
      className={cn('w-full', className)}
    />
  )
}

export default DateTimePicker
