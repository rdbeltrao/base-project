'use client'

import { Button } from '@test-pod/ui'
import { Calendar, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatEventDate } from '../../../../utils/date'
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

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
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

    fetchEventDetails()
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
    <div className='container mx-auto px-4 py-8'>
      <Button onClick={handleBack} variant='outline' className='mb-6'>
        Voltar
      </Button>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {event.imageUrl && (
          <div className='w-full h-64 overflow-hidden'>
            <img src={event.imageUrl} alt={event.name} className='w-full h-full object-cover' />
          </div>
        )}
        <div className='p-6'>
          <h1 className='text-2xl font-bold mb-4'>{event.name}</h1>

          <div className='flex flex-col gap-4 mb-6'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Calendar size={18} />
              <span>{formatEventDate(new Date(event.eventDate))}</span>
            </div>

            {event.location && (
              <div className='flex items-center gap-2 text-gray-600'>
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            )}

            <div className='flex items-center gap-2 text-gray-600'>
              <Users size={18} />
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
        </div>
      </div>
    </div>
  )
}
