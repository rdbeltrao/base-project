'use client'

import { Button } from '@test-pod/ui'
import { Calendar, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatEventDate } from '../../../utils/date'

interface Event {
  id: number
  name: string
  description: string
  eventDate: string
  location: string
  onlineLink?: string
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

export default function EventosPage() {
  const [eventos, setEventos] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true)

        // Fetch events directly from the Next.js API route
        const response = await fetch('/api/events?active=true')

        if (!response.ok) {
          throw new Error('Falha ao buscar eventos')
        }

        const data = await response.json()
        setEventos(data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar eventos:', err)
        setError('Não foi possível carregar os eventos. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  const getEventImage = (id: number) => {
    const images = ['/event1.jpg', '/event2.jpg', '/event3.jpg', '/event4.jpg']
    return images[id % images.length]
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Eventos</h1>
      </div>

      {loading && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Carregando eventos...</p>
        </div>
      )}

      {error && (
        <div className='text-center py-12'>
          <p className='text-red-500'>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {eventos.map(evento => {
            const imagem = getEventImage(evento.id)

            return (
              <div
                key={evento.id}
                className='rounded-lg border bg-card overflow-hidden flex flex-col'
              >
                <div className='relative h-48'>
                  <img src={imagem} alt={evento.name} className='w-full h-full object-cover' />
                </div>
                <div className='p-4 flex-1 flex flex-col'>
                  <div className='flex flex-col gap-2'>
                    <h3 className='text-lg font-semibold'>{evento.name}</h3>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Calendar size={16} />
                      <span>{formatEventDate(new Date(evento.eventDate))}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <MapPin size={16} />
                      <span>{evento.location}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Users size={16} />
                      <span>{evento.realAvailableSpots} vagas disponíveis</span>
                    </div>
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      onClick={() => (window.location.href = `/dashboard/events/${evento.id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
