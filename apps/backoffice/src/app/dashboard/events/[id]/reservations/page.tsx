'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@test-pod/ui'
import { ArrowLeft, CheckCircle, XCircle, Filter, MoreHorizontal } from 'lucide-react'
import { formatDate } from '@test-pod/utils'
import { useRouter } from 'next/navigation'
import { useAuth } from '@test-pod/auth-shared'

interface Reservation {
  id: number
  eventId: number
  userId: string
  status: 'confirmed' | 'canceled'
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Event {
  id: number
  name: string
  eventDate: string
}

export default function EventReservationsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { hasPermissions } = useAuth()
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'canceled'>('all')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const eventId = params.id

  const filteredReservations =
    filter === 'all' ? reservations : reservations.filter(r => r.status === filter)

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }
      const data = await response.json()
      setEvent(data)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to fetch event details')
    }
  }

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filter !== 'all') {
        queryParams.append('status', filter)
      }

      const response = await fetch(
        `/api/events/${eventId}/reservations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reservations')
      }

      const data = await response.json()
      setReservations(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError('Failed to load reservations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReservation = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setIsConfirmDialogOpen(true)
  }

  const handleCancelReservation = (reservation: Reservation) => {
    setCurrentReservation(reservation)
    setIsCancelDialogOpen(true)
  }

  const confirmReservation = async () => {
    if (!currentReservation) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/reservations/${currentReservation.id}/confirm`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to confirm reservation')
      }

      fetchReservations()
      setIsConfirmDialogOpen(false)
      setCurrentReservation(null)
    } catch (err) {
      console.error('Error confirming reservation:', err)
      setError('Failed to confirm reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const cancelReservation = async () => {
    if (!currentReservation) return

    try {
      setActionLoading(true)
      const response = await fetch(`/api/reservations/${currentReservation.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel reservation')
      }

      fetchReservations()
      setIsCancelDialogOpen(false)
      setCurrentReservation(null)
    } catch (err) {
      console.error('Error canceling reservation:', err)
      setError('Failed to cancel reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
    fetchReservations()
  }, [eventId])

  useEffect(() => {
    fetchReservations()
  }, [filter])

  return (
    <>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold tracking-tight'>
            {event ? `Reservations for ${event.name}` : 'Event Reservations'}
          </h1>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Filter:</span>
          </div>
          <div className='flex gap-2'>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size='sm'
            >
              All
            </Button>
            <Button
              variant={filter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setFilter('confirmed')}
              size='sm'
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'canceled' ? 'default' : 'outline'}
              onClick={() => setFilter('canceled')}
              size='sm'
            >
              Canceled
            </Button>
          </div>
        </div>

        {loading && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>Loading reservations...</p>
          </div>
        )}

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className='bg-white shadow-md rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email
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
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-4 text-center text-sm text-gray-500'>
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        #{reservation.id}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {reservation.user.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {reservation.user.email}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(new Date(reservation.createdAt))}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reservation.status === 'confirmed' ? (
                            <>
                              <CheckCircle className='h-3 w-3' />
                              <span>Confirmed</span>
                            </>
                          ) : (
                            <>
                              <XCircle className='h-3 w-3' />
                              <span>Canceled</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        {hasPermissions(['reservation.manage']) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Open menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {reservation.status === 'canceled' &&
                                hasPermissions(['reservation.confirm']) && (
                                  <DropdownMenuItem
                                    onClick={() => handleConfirmReservation(reservation)}
                                  >
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    Confirm
                                  </DropdownMenuItem>
                                )}
                              {reservation.status === 'confirmed' &&
                                hasPermissions(['reservation.delete']) && (
                                  <DropdownMenuItem
                                    onClick={() => handleCancelReservation(reservation)}
                                  >
                                    <XCircle className='mr-2 h-4 w-4' />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Reservation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Confirm Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this reservation? This will allow the user to attend
              the event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmReservation} disabled={actionLoading}>
              {actionLoading ? 'Confirming...' : 'Confirm Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This will prevent the user from
              attending the event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              No, Keep Reservation
            </Button>
            <Button variant='destructive' onClick={cancelReservation} disabled={actionLoading}>
              {actionLoading ? 'Canceling...' : 'Yes, Cancel Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
