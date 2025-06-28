'use client'

import { Button } from '@test-pod/ui'
import { Calendar, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatEventDate } from '../../../../utils/date'
import { useRouter } from 'next/navigation'

// Define the Event interface directly in the component
interface Event {
  id: number;
  name: string;
  description: string;
  eventDate: string;
  location: string;
  onlineLink?: string;
  maxCapacity: number;
  realAvailableSpots: number;
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Define the Reservation interface
interface Reservation {
  id: number;
  eventId: number;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch event details directly from the Next.js API route
        const eventResponse = await fetch(`/api/events/${params.id}`)
        
        if (!eventResponse.ok) {
          throw new Error('Falha ao buscar detalhes do evento')
        }
        
        const eventData = await eventResponse.json()
        setEvent(eventData)
        
        // Fetch event reservations
        const reservationsResponse = await fetch(`/api/events/${params.id}/reservations`)
        
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json()
          setReservations(reservationsData)
        }
        
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar detalhes do evento:', err)
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
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando detalhes do evento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleBack}>Voltar</Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-gray-500">Evento não encontrado</p>
        <Button onClick={handleBack}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={handleBack} variant="outline" className="mb-6">
        Voltar
      </Button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
          
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span>{formatEventDate(new Date(event.eventDate))}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={18} />
              <span>{event.realAvailableSpots} vagas disponíveis de {event.maxCapacity}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Descrição</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>
          
          {event.onlineLink && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Link Online</h2>
              <a 
                href={event.onlineLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {event.onlineLink}
              </a>
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Reservas ({reservations.length})</h2>
            
            {reservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Nome</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b">
                        <td className="py-2 px-4">{reservation.user?.name || 'N/A'}</td>
                        <td className="py-2 px-4">{reservation.user?.email || 'N/A'}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            reservation.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : reservation.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status === 'CONFIRMED' 
                              ? 'Confirmado' 
                              : reservation.status === 'PENDING' 
                                ? 'Pendente' 
                                : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {new Date(reservation.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma reserva encontrada para este evento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
