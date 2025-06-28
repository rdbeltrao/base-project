'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
} from '@test-pod/ui'
import { format } from 'date-fns'
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import RoleForm, { Role as RoleFormType } from './components/role-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@test-pod/ui'

import { useAuth } from '@test-pod/auth-shared'

interface Role extends Omit<RoleFormType, 'permissions'> {
  createdAt: string
  permissions?: RoleFormType['permissions']
}

export default function RolesPage() {
  const { hasPermissions } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/roles')

      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }

      const data = await response.json()
      setRoles(data)
      setError(null)
    } catch (err) {
      setError('Error loading roles. Please try again.')
      console.error('Error fetching roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setCurrentRole(role)
    setIsEditModalOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setCurrentRole(role)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteRole = async () => {
    if (!currentRole) {
      return
    }

    try {
      const response = await fetch(`/api/roles/${currentRole.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete role')
      }

      fetchRoles()
      setIsDeleteModalOpen(false)
      setCurrentRole(null)
    } catch (err) {
      console.error('Error deleting role:', err)
      setError('Failed to delete role. Please try again.')
    }
  }

  const handleFormSubmit = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setCurrentRole(null)
    fetchRoles()
  }

  if (loading) {
    return <div className='flex justify-center items-center h-96'>Loading roles...</div>
  }

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Roles</h1>
        <Button onClick={handleCreateRole}>
          <Plus className='mr-2 h-4 w-4' />
          Add Role
        </Button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created At
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-6 py-4 text-center text-sm text-gray-500'>
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map(role => (
                <tr key={role.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {role.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {role.description || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {format(new Date(role.createdAt), 'PPP')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {role.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        {hasPermissions(['role.delete']) && role.active && (
                          <DropdownMenuItem onClick={() => handleDeleteRole(role)}>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <RoleForm onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role information and assigned permissions.</DialogDescription>
          </DialogHeader>
          <RoleForm role={currentRole} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role {currentRole?.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDeleteRole}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
