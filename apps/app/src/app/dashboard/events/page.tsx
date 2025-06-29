'use client'

import { Button, Input } from '@test-pod/ui'
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Link,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { formatDate } from '@test-pod/utils'

interface Event {
  id: number
  name: string
  description: string
  eventDate: string
  location: string
  imageUrl: string
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

interface PaginationData {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface EventsResponse {
  events: Event[]
  pagination: PaginationData
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    fromDate: '',
    toDate: '',
  })
  // Armazena os filtros que foram aplicados na última busca
  const [_appliedFilters, setAppliedFilters] = useState({
    name: '',
    fromDate: '',
    toDate: '',
  })
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  })

  const observerTarget = useRef<HTMLDivElement | null>(null)

  const fetchEvents = useCallback(
    async (
      params: { name?: string; fromDate?: string; toDate?: string } = {},
      reset: boolean = true
    ) => {
      try {
        if (reset) {
          setInitialLoading(true)
        } else {
          setLoadingMore(true)
        }

        const offset = reset ? 0 : pagination.offset + pagination.limit

        const queryParams = new URLSearchParams()
        queryParams.append('active', 'true')
        queryParams.append('limit', pagination.limit.toString())
        queryParams.append('offset', offset.toString())

        if (params.name) {
          queryParams.append('name', params.name)
        }
        if (params.fromDate) {
          queryParams.append('fromDate', params.fromDate)
        }
        if (params.toDate) {
          queryParams.append('toDate', params.toDate)
        }

        const response = await fetch(`/api/events?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error('Falha ao buscar eventos')
        }

        const data: EventsResponse = await response.json()

        if (reset) {
          setEvents(data.events)
        } else {
          setEvents(prev => [...prev, ...data.events])
        }

        setPagination(data.pagination)
        setError(null)
      } catch (_err) {
        setError('Não foi possível carregar os eventos. Tente novamente mais tarde.')
      } finally {
        if (reset) {
          setInitialLoading(false)
        } else {
          setLoadingMore(false)
        }
        setLoading(false)
      }
    },
    [pagination.limit, pagination.offset]
  )

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
    fetchEvents(filters, true)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      name: '',
      fromDate: '',
      toDate: '',
    }
    setFilters(clearedFilters)
    setAppliedFilters(clearedFilters)
    fetchEvents(clearedFilters, true)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMore && !initialLoading) {
          fetchEvents(_appliedFilters, false)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [pagination.hasMore, loadingMore, initialLoading, _appliedFilters, fetchEvents])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Eventos</h1>

        <Button
          variant='outline'
          className='sm:hidden flex items-center gap-2'
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <Filter className='h-4 w-4' />
          Filtros
          {filtersVisible ? (
            <ChevronUp className='h-4 w-4 ml-1' />
          ) : (
            <ChevronDown className='h-4 w-4 ml-1' />
          )}
        </Button>
      </div>

      <div
        className={`bg-white p-4 rounded-lg shadow-sm ${!filtersVisible ? 'hidden sm:block' : 'block'}`}
      >
        <h2 className='text-lg font-medium mb-4'>Filtros</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Nome do evento
            </label>
            <div className='relative'>
              <Input
                id='name'
                type='text'
                placeholder='Buscar por nome'
                value={filters.name}
                onChange={e => setFilters({ ...filters, name: e.target.value })}
                className='pl-9'
              />
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500' />
            </div>
          </div>

          <div>
            <label htmlFor='fromDate' className='block text-sm font-medium text-gray-700 mb-1'>
              Data inicial
            </label>
            <Input
              id='fromDate'
              type='date'
              value={filters.fromDate}
              onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
              className='flex-col'
            />
          </div>

          <div>
            <label htmlFor='toDate' className='block text-sm font-medium text-gray-700 mb-1'>
              Data final
            </label>
            <Input
              id='toDate'
              type='date'
              value={filters.toDate}
              onChange={e => setFilters({ ...filters, toDate: e.target.value })}
              className='flex-col'
            />
          </div>
        </div>

        <div className='flex justify-end mt-4 gap-2'>
          <Button variant='outline' onClick={handleClearFilters}>
            <X className='mr-2 h-4 w-4' />
            Limpar
          </Button>
          <Button onClick={handleApplyFilters}>
            <Search className='mr-2 h-4 w-4' />
            Aplicar filtros
          </Button>
        </div>
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

      {!initialLoading && !error && (
        <>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {events.map(event => {
              return (
                <div
                  key={event.id}
                  className='rounded-lg border bg-card overflow-hidden flex flex-col'
                >
                  <div className='relative h-48'>
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='p-4 flex-1 flex flex-col'>
                    <div className='flex flex-col gap-2'>
                      <h3 className='text-lg font-semibold'>{event.name}</h3>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Calendar size={16} />
                        <span>{formatDate(new Date(event.eventDate))}</span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-600'>
                        {event.location ? (
                          <>
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </>
                        ) : (
                          <>
                            <Link size={16} />
                            <span>Online</span>
                          </>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-gray-600'>
                        <Users size={16} />
                        <span>{event.realAvailableSpots} vagas disponíveis</span>
                      </div>
                    </div>
                    <div className='flex justify-end'>
                      <Button
                        onClick={() => (window.location.href = `/dashboard/events/${event.id}`)}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div ref={observerTarget} className='h-10 w-full flex items-center justify-center mt-6'>
            {loadingMore && (
              <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary'></div>
            )}
          </div>

          {!loadingMore && !pagination.hasMore && events.length > 0 && (
            <p className='text-center text-gray-500 mt-6'>Não há mais eventos para carregar</p>
          )}

          {!loadingMore && events.length === 0 && (
            <p className='text-center text-gray-500 mt-6'>Nenhum evento encontrado</p>
          )}
        </>
      )}
    </div>
  )
}
