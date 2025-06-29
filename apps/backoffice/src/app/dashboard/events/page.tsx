'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
  Input,
} from '@test-pod/ui'
import { MoreHorizontal, Plus, Pencil, Trash2, Search, X, Calendar, Ticket } from 'lucide-react'
import EventForm from './components/event-form'
import type { EventAttributes } from '@test-pod/database'
import { formatDate } from '@test-pod/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@test-pod/ui'
import DateTimePicker from '@test-pod/ui/src/components/ui/date-time-picker'

import { useAuth } from '@test-pod/auth-shared'

interface Event extends EventAttributes {
  user?: {
    name: string
    email: string
  }
}

export default function EventsPage() {
  const router = useRouter()
  const { hasPermissions } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nameFilter, setNameFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState<Date | undefined>(undefined)
  const [toDateFilter, setToDateFilter] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string>('active')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (nameFilter) {
        params.append('name', nameFilter)
      }

      if (fromDateFilter) {
        params.append('fromDate', fromDateFilter.toISOString())
      }

      if (toDateFilter) {
        params.append('toDate', toDateFilter.toISOString())
      }

      if (statusFilter !== 'all') {
        params.append('active', statusFilter === 'active' ? 'true' : 'false')
      }

      const queryString = params.toString()
      const url = `/api/events${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError('Error loading events. Please try again.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setCurrentEvent(event)
    setIsEditModalOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setCurrentEvent(event)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteEvent = async () => {
    if (!currentEvent) {
      return
    }

    try {
      const response = await fetch(`/api/events/${currentEvent.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      fetchEvents()
      setIsDeleteModalOpen(false)
      setCurrentEvent(null)
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event. Please try again.')
    }
  }

  const handleFormSubmit = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setCurrentEvent(null)
    fetchEvents()
  }

  if (loading) {
    return <div className='flex justify-center items-center h-96'>Loading events...</div>
  }

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Events</h1>
        <Button onClick={handleCreateEvent}>
          <Plus className='mr-2 h-4 w-4' />
          Add Event
        </Button>
      </div>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-medium'>Filters</h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>Event Name</label>
            <div className='relative'>
              <Input
                placeholder='Search by name...'
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className='pr-8'
              />
              {nameFilter && (
                <button
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  onClick={() => setNameFilter('')}
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>From Date</label>
            <div className='flex items-center'>
              <Calendar className='mr-2 h-4 w-4 text-gray-400' />
              <DateTimePicker
                value={fromDateFilter}
                onChange={setFromDateFilter}
                className='w-full flex-col'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>To Date</label>
            <div className='flex items-center'>
              <Calendar className='mr-2 h-4 w-4 text-gray-400' />
              <DateTimePicker
                value={toDateFilter}
                onChange={setToDateFilter}
                className='w-full flex-col'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>Status</label>
            <select
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              setNameFilter('')
              setFromDateFilter(undefined)
              setToDateFilter(undefined)
              setStatusFilter('active')
            }}
          >
            Clear Filters
          </Button>
          <Button onClick={fetchEvents}>
            <Search className='mr-2 h-4 w-4' />
            Apply Filters
          </Button>
        </div>
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
                Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Location
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Capacity
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Available
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Creator
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
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className='px-6 py-4 text-center text-sm text-gray-500'>
                  No events found
                </td>
              </tr>
            ) : (
              events.map(event => (
                <tr key={event.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {event.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(new Date(event.eventDate))}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {event.location || event.onlineLink ? (
                      event.location || 'Online'
                    ) : (
                      <span className='text-gray-400'>Not specified</span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {event.maxCapacity}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {event.maxCapacity - event.reservedSpots}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {event.user?.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>

                        {hasPermissions(['reservation.manage']) && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/events/${event.id}/reservations`)
                            }
                          >
                            <Ticket className='mr-2 h-4 w-4' />
                            View Reservations
                          </DropdownMenuItem>
                        )}
                        {hasPermissions(['event.delete']) && event.active && (
                          <DropdownMenuItem onClick={() => handleDeleteEvent(event)}>
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

      {/* Create Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Add a new event to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event information. All changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <EventForm event={currentEvent} onSubmit={handleFormSubmit} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event {currentEvent?.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
