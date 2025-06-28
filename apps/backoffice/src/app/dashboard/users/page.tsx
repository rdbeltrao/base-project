'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@test-pod/ui'
import { Button } from '@test-pod/ui'
import { format } from 'date-fns'
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import UserForm from './components/user-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@test-pod/ui'

import { useAuth } from '@test-pod/auth-shared'

interface User {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
  roles: { id: number; name: string }[]
}

export default function UsersPage() {
  const { hasPermissions } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError('Error loading users. Please try again.')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      fetchUsers()
      setIsDeleteModalOpen(false)
      setCurrentUser(null)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Failed to delete user. Please try again.')
    }
  }

  const handleFormSubmit = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setCurrentUser(null)
    fetchUsers()
  }

  if (loading) {
    return <div className='flex justify-center items-center h-96'>Loading users...</div>
  }

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Users</h1>
        <Button onClick={handleCreateUser}>
          <Plus className='mr-2 h-4 w-4' />
          Add User
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
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Groups
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-6 py-4 text-center text-sm text-gray-500'>
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {user.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <div className='flex flex-wrap gap-1'>
                      {user.roles.map(role => (
                        <span
                          key={role.id}
                          className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {format(new Date(user.createdAt), 'PPP')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        {hasPermissions(['user.delete']) ||
                          (user.active && (
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <UserForm onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <UserForm user={currentUser} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {currentUser?.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
