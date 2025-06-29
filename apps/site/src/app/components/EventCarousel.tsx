'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Event = {
  id: string
  name: string
  description: string
  imageUrl: string
  eventDate: string
  location: string
  onlineLink?: string
}

export default function EventCarousel() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Falha ao buscar eventos em destaque')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Erro ao buscar eventos em destaque:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % events.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [events.length])

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + events.length) % events.length)
  }

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % events.length)
  }

  // Formatar a data do evento
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })
    } catch (_error) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className='w-full h-96 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className='w-full h-96 flex items-center justify-center'>
        <p className='text-lg text-gray-600'>Nenhum evento em destaque encontrado</p>
      </div>
    )
  }

  const currentEvent = events[currentIndex]

  return (
    <div className='relative w-full h-96 overflow-hidden rounded-lg'>
      <div className='absolute inset-0'>
        <Image
          src={currentEvent.imageUrl}
          alt={currentEvent.name}
          fill
          className='object-cover'
          priority
        />
        <div className='absolute inset-0 bg-black bg-opacity-50'></div>
      </div>

      {/* Conteúdo do evento */}
      <div className='relative z-10 h-full flex flex-col justify-end p-6 text-white'>
        <h3 className='text-2xl md:text-3xl font-bold mb-2'>{currentEvent.name}</h3>
        <p className='text-sm md:text-base mb-2 line-clamp-2'>{currentEvent.description}</p>
        <div className='flex flex-col md:flex-row md:items-center text-sm opacity-80 space-y-1 md:space-y-0 md:space-x-4'>
          <p>{formatEventDate(currentEvent.eventDate)}</p>
          <p>{currentEvent.location || currentEvent.onlineLink}</p>
        </div>
      </div>

      {/* Botões de navegação */}
      <button
        onClick={goToPrevious}
        className='absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all'
        aria-label='Evento anterior'
      >
        <ChevronLeft className='h-6 w-6' />
      </button>
      <button
        onClick={goToNext}
        className='absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all'
        aria-label='Próximo evento'
      >
        <ChevronRight className='h-6 w-6' />
      </button>

      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2'>
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white bg-opacity-50'}`}
            aria-label={`Ir para o evento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
