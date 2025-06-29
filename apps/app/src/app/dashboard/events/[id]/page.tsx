'use client'

import { Button, ConfirmationDialog } from '@test-pod/ui'
import { AlertCircle, Calendar, Check, MapPin, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDate } from '@test-pod/utils'
import { useRouter } from 'next/navigation'

interface Event {
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
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface Reservation {
  id: number
  eventId: number
  userId: string
  status: 'confirmed' | 'canceled'
  createdAt: string
  updatedAt: string
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [reservationLoading, setReservationLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const router = useRouter()

  const fetchEventDetails = async () => {
    try {
      setLoading(true)

      const eventResponse = await fetch(`/api/events/${params.id}`)

      if (!eventResponse.ok) {
        throw new Error('Falha ao buscar detalhes do evento')
      }

      const eventData = await eventResponse.json()
      setEvent(eventData)

      setError(null)
    } catch (_err) {
      setError('Não foi possível carregar os detalhes do evento. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReservation = async () => {
    try {
      const response = await fetch(`/api/reservations/event/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setReservation(data)
      }
    } catch (_err) {
      console.error('Erro ao buscar reserva:', _err)
    }
  }

  const handleReserve = async () => {
    if (!event) {
      return
    }

    try {
      setReservationLoading(true)

      const response = await fetch(`/api/events/${event.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao fazer reserva')
      }

      const reservationData = await response.json()
      setReservation(reservationData)

      // Atualizar o número de vagas disponíveis
      await fetchEventDetails()

      setMessage({
        type: 'success',
        text: 'Sua vaga foi reservada com sucesso!',
      })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ocorreu um erro ao processar sua reserva',
      })
    } finally {
      setReservationLoading(false)
    }
  }

  const openCancelDialog = () => {
    setConfirmDialogOpen(true)
  }

  const handleCancelReservation = async () => {
    if (!reservation) {
      return
    }

    try {
      setReservationLoading(true)

      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao cancelar reserva')
      }

      // Atualizar o status da reserva para cancelado
      setReservation({
        ...reservation,
        status: 'canceled',
      })

      // Atualizar o número de vagas disponíveis
      await fetchEventDetails()

      setMessage({
        type: 'success',
        text: 'Sua reserva foi cancelada com sucesso.',
      })

      setConfirmDialogOpen(false)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ocorreu um erro ao cancelar sua reserva',
      })
    } finally {
      setReservationLoading(false)
    }
  }

  const handleCancelDialogClose = () => {
    setConfirmDialogOpen(false)
  }

  const handleConfirmReservation = async () => {
    if (!reservation || !event) {
      return
    }

    try {
      setReservationLoading(true)

      const response = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao confirmar reserva')
      }

      // Atualizar o status da reserva para confirmado
      setReservation({
        ...reservation,
        status: 'confirmed',
      })

      // Atualizar o número de vagas disponíveis
      await fetchEventDetails()

      setMessage({
        type: 'success',
        text: 'Sua reserva foi confirmada com sucesso.',
      })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ocorreu um erro ao confirmar sua reserva',
      })
    } finally {
      setReservationLoading(false)
    }
  }

  useEffect(() => {
    fetchEventDetails()
    fetchUserReservation()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-gray-500'>Carregando detalhes do evento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col justify-center items-center h-64 gap-4'>
        <p className='text-red-500'>{error}</p>
        <Button onClick={handleBack}>Voltar</Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='flex flex-col justify-center items-center h-64 gap-4'>
        <p className='text-gray-500'>Evento não encontrado</p>
        <Button onClick={handleBack}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className='space-y-6 px-4 sm:px-6 md:px-0'>
      <Button variant='outline' className='mb-4' onClick={handleBack}>
        Voltar
      </Button>

      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
        >
          <div className='flex items-center gap-2'>
            {message.type === 'success' ? (
              <Check className='h-5 w-5' />
            ) : (
              <AlertCircle className='h-5 w-5' />
            )}
            <p>{message.text}</p>
          </div>
          <button
            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
            onClick={() => setMessage(null)}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {event.imageUrl && (
          <div className='w-full h-48 sm:h-64 relative'>
            <img src={event.imageUrl} alt={event.name} className='w-full h-full object-cover' />
          </div>
        )}
        <div className='p-4 sm:p-6'>
          <h1 className='text-xl sm:text-2xl font-bold mb-2'>{event.name}</h1>

          <div className='flex flex-col gap-4 mb-6'>
            <div className='flex items-center text-gray-600 mb-4 text-sm sm:text-base'>
              <Calendar className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
              <span>{formatDate(new Date(event.eventDate))}</span>
            </div>

            {event.location && (
              <div className='flex items-center text-gray-600 mb-4 text-sm sm:text-base'>
                <MapPin className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
                <span className='break-words'>{event.location}</span>
              </div>
            )}

            <div className='flex items-center text-gray-600 mb-6 text-sm sm:text-base'>
              <Users className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
              <span>
                {event.realAvailableSpots} vagas disponíveis de {event.maxCapacity}
              </span>
            </div>
          </div>

          {event.description && (
            <div className='mb-6'>
              <h2 className='text-xl font-semibold mb-2'>Descrição</h2>
              <p className='text-gray-700'>{event.description}</p>
            </div>
          )}

          {event.onlineLink && (
            <div className='mb-6'>
              <h2 className='text-xl font-semibold mb-2'>Link Online</h2>
              <a
                href={event.onlineLink}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                {event.onlineLink}
              </a>
            </div>
          )}

          <div className='mt-6 sm:mt-8'>
            <h2 className='text-lg sm:text-xl font-semibold mb-4'>Reserva</h2>

            {reservation ? (
              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg border'>
                {reservation.status === 'confirmed' ? (
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-2 text-green-600'>
                      <Check size={16} className='sm:w-5 sm:h-5' />
                      <span className='font-medium text-sm sm:text-base'>Reserva confirmada</span>
                    </div>
                    <p className='text-gray-600'>
                      Você tem uma reserva confirmada para este evento.
                    </p>
                    <Button
                      variant='destructive'
                      onClick={openCancelDialog}
                      disabled={reservationLoading}
                    >
                      Cancelar reserva
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-2 text-red-600'>
                      <X size={16} className='sm:w-5 sm:h-5' />
                      <span className='font-medium text-sm sm:text-base'>Reserva cancelada</span>
                    </div>
                    <p className='text-gray-600'>Sua reserva para este evento foi cancelada.</p>
                    {event.realAvailableSpots > 0 && (
                      <Button onClick={handleConfirmReservation} disabled={reservationLoading}>
                        {reservationLoading ? 'Processando...' : 'Confirmar reserva'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {event.realAvailableSpots > 0 ? (
                  <div className='flex flex-col gap-4'>
                    <p className='text-gray-600'>
                      Há {event.realAvailableSpots} vagas disponíveis para este evento.
                    </p>
                    <Button onClick={handleReserve} disabled={reservationLoading}>
                      {reservationLoading ? 'Processando...' : 'Reservar vaga'}
                    </Button>
                  </div>
                ) : (
                  <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                    <p className='text-yellow-800'>
                      Este evento está com todas as vagas preenchidas.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title='Cancelar Reserva'
        description='Tem certeza que deseja cancelar sua reserva para este evento? Esta ação não pode ser desfeita.'
        confirmText='Sim, cancelar'
        cancelText='Não, manter'
        onConfirm={handleCancelReservation}
        onCancel={handleCancelDialogClose}
        variant='destructive'
        loading={reservationLoading}
      />
    </div>
  )
}
