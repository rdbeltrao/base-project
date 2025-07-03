'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, Input, Textarea } from '@test-pod/ui'
import PermissionSelector from './permission-selector'

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).min(1, 'Please select at least one permission'),
})

type FormValues = z.infer<typeof formSchema>

interface Permission {
  id: number
  resource: string
  action: string
  name: string
  description?: string
}

export interface Role {
  id: number
  name: string
  description?: string
  active: boolean
  permissions?: { id: number; name: string; description?: string }[]
}

interface RoleFormProps {
  role?: Role | null
  onSubmit: () => void
}

export default function RoleForm({ role, onSubmit }: RoleFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values or role data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissionIds: role?.permissions?.map(permission => permission.id) || [],
    },
  })

  // Fetch permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true)
        const response = await fetch('/api/roles/permissions/all')

        if (!response.ok) {
          throw new Error('Failed to fetch permissions')
        }

        const data = await response.json()
        setPermissions(
          data.map((permission: Permission) => ({
            ...permission,
            name: `${permission.resource}.${permission.action}`,
          }))
        )
      } catch (err) {
        console.error('Error fetching permissions:', err)
        setError('Failed to load permissions. Please try again.')
      } finally {
        setLoadingPermissions(false)
      }
    }

    fetchPermissions()
  }, [])

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      setError(null)

      const url = role ? `/api/roles/${role.id}` : '/api/roles'
      const method = role ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save role')
      }

      // Call the onSubmit callback to refresh the role list
      onSubmit()
    } catch (err: any) {
      console.error('Error saving role:', err)
      setError(err.message || 'Failed to save role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm font-medium'>
            Name
          </label>
          <Input
            id='name'
            placeholder='Enter role name'
            {...form.register('name')}
            aria-invalid={form.formState.errors.name ? 'true' : 'false'}
          />
          {form.formState.errors.name && (
            <p className='text-sm text-red-500'>{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label htmlFor='description' className='text-sm font-medium'>
            Description
          </label>
          <Textarea
            id='description'
            placeholder='Enter role description'
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className='text-sm text-red-500'>{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Permissions</label>
          <Controller
            name='permissionIds'
            control={form.control}
            render={({ field }) => (
              <div>
                {permissions.length === 0 ? (
                  <div className='p-4 border rounded-md bg-gray-50 text-center'>
                    {loadingPermissions ? (
                      <p>Loading permissions...</p>
                    ) : (
                      <p>No permissions available</p>
                    )}
                  </div>
                ) : (
                  <PermissionSelector
                    allPermissions={permissions}
                    selectedPermissionIds={field.value}
                    onChange={selectedIds => {
                      field.onChange(selectedIds)
                    }}
                  />
                )}
                {form.formState.errors.permissionIds && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.permissionIds.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className='flex justify-end space-x-4'>
          <Button type='button' variant='outline' onClick={onSubmit}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  )
}
