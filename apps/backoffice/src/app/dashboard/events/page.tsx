'use client'

import React, { useState, useEffect } from 'react'
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
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Calendar,
  Ticket,
  Star,
} from 'lucide-react'
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
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  })
  const [error, setError] = useState<string | null>(null)

  const [nameFilter, setNameFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState<Date | undefined>(undefined)
  const [toDateFilter, setToDateFilter] = useState<Date | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [isToggleFeatureLoading, setIsToggleFeatureLoading] = useState(false)

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents(1)
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    fetchEvents(1)
  }, [nameFilter, fromDateFilter, toDateFilter, statusFilter, featuredFilter])

  // React event handler wrapper for pagination buttons
  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    fetchEvents(page)
  }

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true)

      const limit = 10
      const offset = (page - 1) * limit

      const params = new URLSearchParams()

      params.set('limit', limit.toString())
      params.set('offset', offset.toString())
      if (nameFilter) {
        params.set('name', nameFilter)
      }

      if (fromDateFilter) {
        params.set('fromDate', fromDateFilter.toISOString())
      }

      if (toDateFilter) {
        params.set('toDate', toDateFilter.toISOString())
      }

      if (statusFilter !== 'all') {
        params.set('active', statusFilter === 'active' ? 'true' : 'false')
      }

      if (featuredFilter !== 'all') {
        params.set('featured', featuredFilter === 'featured' ? 'true' : 'false')
      }

      const queryString = params.toString()
      const url = `/api/events${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()

      setEvents(data.events)

      const returnedOffset = data.pagination.offset
      const returnedLimit = data.pagination.limit

      setPagination({
        total: data.pagination.total,
        limit: returnedLimit,
        offset: returnedOffset,
        currentPage: page,
        totalPages: Math.ceil(data.pagination.total / returnedLimit),
        hasMore: data.pagination.hasMore,
      })

      setError(null)
    } catch (_err) {
      setError('Error loading events. Please try again.')
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
    } catch (_err) {
      setError('Failed to delete event. Please try again.')
    }
  }

  const toggleEventFeature = async (event: Event) => {
    try {
      setIsToggleFeatureLoading(true)

      const response = await fetch(`/api/events/${event.id}/feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !event.featured }),
      })

      if (!response.ok) {
        throw new Error('Failed to update event feature status')
      }

      fetchEvents()
    } catch (_err) {
      setError('Failed to update feature status. Please try again.')
    } finally {
      setIsToggleFeatureLoading(false)
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

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg'>
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

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>Featured</label>
            <select
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={featuredFilter}
              onChange={e => setFeaturedFilter(e.target.value)}
            >
              <option value='all'>All</option>
              <option value='featured'>Featured</option>
              <option value='not-featured'>Not Featured</option>
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
              setFeaturedFilter('all')
            }}
          >
            Clear Filters
          </Button>
          <Button onClick={() => fetchEvents()}>
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
                Featured
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
                        event.featured
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.featured ? 'Featured' : 'Not Featured'}
                    </span>
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
                        <DropdownMenuItem
                          onClick={() => toggleEventFeature(event)}
                          disabled={isToggleFeatureLoading}
                        >
                          <Star className='mr-2 h-4 w-4' />
                          {event.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        </DropdownMenuItem>
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

      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4'>
          <div className='flex flex-1 justify-between sm:hidden'>
            <Button
              variant='outline'
              onClick={handlePageClick(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              onClick={handlePageClick(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
          <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing <span className='font-medium'>{pagination.offset + 1}</span> to{' '}
                <span className='font-medium'>
                  {Math.min(pagination.offset + pagination.limit, pagination.total)}
                </span>{' '}
                of <span className='font-medium'>{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav
                className='isolate inline-flex -space-x-px rounded-md shadow-sm'
                aria-label='Pagination'
              >
                <Button
                  variant='outline'
                  className='rounded-l-md px-2'
                  onClick={handlePageClick(Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current page
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 1
                    )
                  })
                  .map((page, index, array) => {
                    // Add ellipsis where needed
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                    const showEllipsisAfter =
                      index < array.length - 1 && array[index + 1] !== page + 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className='relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300'>
                            ...
                          </span>
                        )}

                        <Button
                          variant={pagination.currentPage === page ? 'default' : 'outline'}
                          className='px-4'
                          onClick={handlePageClick(page)}
                        >
                          {page}
                        </Button>

                        {showEllipsisAfter && (
                          <span className='relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300'>
                            ...
                          </span>
                        )}
                      </React.Fragment>
                    )
                  })}

                <Button
                  variant='outline'
                  className='rounded-r-md px-2'
                  onClick={handlePageClick(
                    Math.min(pagination.totalPages, pagination.currentPage + 1)
                  )}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
