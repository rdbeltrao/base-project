'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked)
    }

    return (
      <label
        className={cn(
          'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full',
          className
        )}
      >
        <input
          type='checkbox'
          className='peer sr-only'
          checked={checked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            'h-full w-full rounded-full bg-gray-300 transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600'
          )}
        />
        <div
          className={cn(
            'absolute left-1 top-1 h-4 w-4 transform rounded-full bg-white transition-transform peer-checked:translate-x-5'
          )}
        />
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
