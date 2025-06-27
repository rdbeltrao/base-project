'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Select, { StylesConfig } from 'react-select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Input,
} from '@test-pod/ui'

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
  roleIds: z.array(z.number()).min(1, 'Please select at least one role'),
})

type FormValues = z.infer<typeof formSchema>

interface Role {
  id: number
  name: string
  description?: string
}

interface SelectOption {
  value: number
  label: string
  description?: string
}

interface User {
  id: number
  name: string
  email: string
  active: boolean
  roles: { id: number; name: string }[]
}

interface UserFormProps {
  user?: User | null
  onSubmit: () => void
}

export default function UserForm({ user, onSubmit }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values or user data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      roleIds: user?.roles?.map(role => role.id) || [],
    },
  })

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/users/roles/all')

        if (!response.ok) {
          throw new Error('Failed to fetch roles')
        }

        const data = await response.json()
        setRoles(data)
      } catch (err) {
        console.error('Error fetching roles:', err)
        setError('Failed to load roles. Please try again.')
      }
    }

    fetchRoles()
  }, [])

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      setError(null)

      // If password is empty and we're editing, remove it from the payload
      if (user && !values.password) {
        delete values.password
      }

      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save user')
      }

      // Call the onSubmit callback to refresh the user list
      onSubmit()
    } catch (err: any) {
      console.error('Error saving user:', err)
      setError(err.message || 'Failed to save user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Custom styles for react-select to match shadcn UI
  const selectStyles: StylesConfig<SelectOption, true> = {
    control: base => ({
      ...base,
      backgroundColor: 'transparent',
      border: '1px solid hsl(var(--input))',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid hsl(var(--input))',
      },
    }),
    menu: base => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      boxShadow: 'var(--shadow)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : state.isFocused
          ? 'hsl(var(--accent))'
          : 'transparent',
      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
      cursor: 'pointer',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: 'hsl(var(--accent))',
    }),
    multiValueLabel: base => ({
      ...base,
      color: 'hsl(var(--accent-foreground))',
    }),
    multiValueRemove: base => ({
      ...base,
      color: 'hsl(var(--accent-foreground))',
      ':hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter user name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='user@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{user ? 'Password (leave blank to keep current)' : 'Password'}</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Enter password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='roleIds'
          render={({ field: _field }) => (
            <FormItem>
              <FormLabel>Roles</FormLabel>
              <FormControl>
                <Controller
                  name='roleIds'
                  control={form.control}
                  render={({ field }) => (
                    <Select<SelectOption, true>
                      isMulti
                      options={roles.map(role => ({
                        value: role.id,
                        label: role.name,
                      }))}
                      value={roles
                        .filter(role => field.value.includes(role.id))
                        .map(role => ({
                          value: role.id,
                          label: role.name,
                        }))}
                      onChange={selectedOptions => {
                        field.onChange(
                          selectedOptions ? selectedOptions.map(option => option.value) : []
                        )
                      }}
                      styles={selectStyles}
                      placeholder='Select roles'
                      className='react-select-container'
                      classNamePrefix='react-select'
                      formatOptionLabel={({ label }: { label: string }) => <div>{label}</div>}
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-4'>
          <Button type='button' variant='outline' onClick={onSubmit}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
