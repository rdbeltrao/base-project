'use client'

import { Button, ConfirmationDialog } from '@test-pod/ui'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@test-pod/utils'

interface Reservation {
  id: number
  eventId: number
  userId: string
  status: 'confirmed' | 'canceled'
  createdAt: string
  updatedAt: string
  event: {
    id: number
    name: string
    description: string
    eventDate: string
    location: string
    onlineLink?: string
    imageUrl?: string
    maxCapacity: number
    realAvailableSpots: number
    active: boolean
  }
}

export default function ReservationPage() {
  const [filter, setFiltro] = useState('todas')
  const [reservation, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const filteredReservation =
    filter === 'todas' ? reservation : reservation.filter(r => r.status === filter)

  const fetchReservations = async (status?: string) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (status && status !== 'todas') {
        queryParams.append('status', status)
      }

      const response = await fetch(
        `/api/reservations/mine${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      )

      if (!response.ok) {
        throw new Error('Falha ao buscar reservas')
      }

      const data = await response.json()
      setReservations(data)
      setError(null)
    } catch (_err) {
      setError('Não foi possível carregar as reservas. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const openCancelDialog = (id: number) => {
    setReservationToCancel(id)
    setConfirmDialogOpen(true)
  }

  const cancelReservation = async () => {
    if (!reservationToCancel) return

    try {
      setCancelLoading(true)
      const response = await fetch(`/api/reservations/${reservationToCancel}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Falha ao cancelar reserva')
      }

      // Atualiza a lista de reservas
      fetchReservations(filter)
      setConfirmDialogOpen(false)
      setReservationToCancel(null)
    } catch (_err) {
      alert('Não foi possível cancelar a reserva. Tente novamente.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleCancelDialogClose = () => {
    setConfirmDialogOpen(false)
    setReservationToCancel(null)
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    fetchReservations(filter)
  }, [filter])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Minhas Reservas</h1>
        <div className='flex gap-2'>
          <Button
            variant={filter === 'todas' ? 'default' : 'outline'}
            onClick={() => setFiltro('todas')}
            size='sm'
          >
            Todas
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setFiltro('confirmed')}
            size='sm'
          >
            Confirmadas
          </Button>
          <Button
            variant={filter === 'canceled' ? 'default' : 'outline'}
            onClick={() => setFiltro('canceled')}
            size='sm'
          >
            Canceladas
          </Button>
        </div>
      </div>

      {loading && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Carregando reservas...</p>
        </div>
      )}

      {error && (
        <div className='text-center py-12'>
          <p className='text-red-500'>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className='space-y-4'>
          {filteredReservation.map(reservation => (
            <div key={reservation.id} className='rounded-lg border bg-card overflow-hidden'>
              <div className='flex flex-col md:flex-row'>
                <div className='relative w-full md:w-64 h-48 md:h-auto'>
                  <img
                    src={
                      reservation.event.imageUrl ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                    }
                    alt={reservation.event.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='p-4 flex-1 flex flex-col'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                    <h3 className='text-lg font-medium'>{reservation.event.name}</h3>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {reservation.status === 'confirmed' ? (
                        <>
                          <CheckCircle className='h-3 w-3' />
                          <span>Confirmada</span>
                        </>
                      ) : (
                        <>
                          <XCircle className='h-3 w-3' />
                          <span>Cancelada</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      <span>{formatDate(new Date(reservation.event.eventDate))}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      <span>{reservation.event.location || 'Online'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-foreground'>Reserva ID:</span>
                      <span>#{reservation.id}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-foreground'>Criada em:</span>
                      <span>{formatDate(new Date(reservation.createdAt))}</span>
                    </div>
                  </div>

                  <div className='mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end'>
                    <Button
                      variant='outline'
                      onClick={() =>
                        (window.location.href = `/dashboard/events/${reservation.eventId}`)
                      }
                    >
                      Ver evento
                    </Button>
                    {reservation.status === 'confirmed' && (
                      <Button
                        variant='destructive'
                        onClick={() => openCancelDialog(reservation.id)}
                      >
                        Cancelar reserva
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReservation.length === 0 && (
            <div className='text-center py-12 border rounded-lg bg-card'>
              <XCircle className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-lg font-medium'>Nenhuma reserva encontrada</h3>
              <p className='text-muted-foreground'>
                Você ainda não possui reservas{' '}
                {filter !== 'todas'
                  ? `com status "${filter === 'confirmed' ? 'confirmada' : 'cancelada'}"`
                  : ''}
                .
              </p>
              <Button className='mt-4' onClick={() => (window.location.href = '/dashboard/events')}>
                Explorar eventos
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title='Cancelar Reserva'
        description='Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.'
        confirmText='Sim, cancelar'
        cancelText='Não, manter'
        onConfirm={cancelReservation}
        onCancel={handleCancelDialogClose}
        variant='destructive'
        loading={cancelLoading}
      />
    </div>
  )
}
