'use client'

import { Button } from '@test-pod/ui'
import { useState } from 'react'
import { Calendar, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'

// Dados de exemplo para reservas
const reservasExemplo = [
  {
    id: 1,
    eventoId: 1,
    titulo: 'Workshop de Inovação',
    data: '15 Jul 2025',
    horario: '14:00 - 17:00',
    local: 'Auditório Principal',
    status: 'confirmada',
    codigoReserva: 'WS-2025-0734',
    imagem:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 2,
    eventoId: 2,
    titulo: 'Palestra: Tendências de Mercado',
    data: '22 Jul 2025',
    horario: '19:00 - 21:00',
    local: 'Sala de Conferências',
    status: 'pendente',
    codigoReserva: 'PL-2025-1289',
    imagem:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
]

export default function ReservasPage() {
  const [filtro, setFiltro] = useState('todas')
  const [reservas, setReservas] = useState(reservasExemplo)

  const reservasFiltradas =
    filtro === 'todas' ? reservas : reservas.filter(r => r.status === filtro)

  const cancelarReserva = (id: number) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      // Em uma aplicação real, aqui faria uma chamada à API
      setReservas(reservas.filter(r => r.id !== id))
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Minhas Reservas</h1>
        <div className='flex gap-2'>
          <Button
            variant={filtro === 'todas' ? 'default' : 'outline'}
            onClick={() => setFiltro('todas')}
            size='sm'
          >
            Todas
          </Button>
          <Button
            variant={filtro === 'confirmada' ? 'default' : 'outline'}
            onClick={() => setFiltro('confirmada')}
            size='sm'
          >
            Confirmadas
          </Button>
          <Button
            variant={filtro === 'pendente' ? 'default' : 'outline'}
            onClick={() => setFiltro('pendente')}
            size='sm'
          >
            Pendentes
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        {reservasFiltradas.map(reserva => (
          <div key={reserva.id} className='rounded-lg border bg-card overflow-hidden'>
            <div className='flex flex-col md:flex-row'>
              <div className='relative w-full md:w-64 h-48 md:h-auto'>
                <img
                  src={reserva.imagem}
                  alt={reserva.titulo}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='p-4 flex-1 flex flex-col'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                  <h3 className='text-lg font-medium'>{reserva.titulo}</h3>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      reserva.status === 'confirmada'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {reserva.status === 'confirmada' ? (
                      <>
                        <CheckCircle className='h-3 w-3' />
                        <span>Confirmada</span>
                      </>
                    ) : (
                      <>
                        <Clock className='h-3 w-3' />
                        <span>Pendente</span>
                      </>
                    )}
                  </div>
                </div>

                <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span>{reserva.data}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    <span>{reserva.horario}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span>{reserva.local}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-foreground'>Código:</span>
                    <span>{reserva.codigoReserva}</span>
                  </div>
                </div>

                <div className='mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => window.open(`/dashboard/eventos/${reserva.eventoId}`)}
                  >
                    Ver evento
                  </Button>
                  <Button variant='destructive' onClick={() => cancelarReserva(reserva.id)}>
                    Cancelar reserva
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {reservasFiltradas.length === 0 && (
          <div className='text-center py-12 border rounded-lg bg-card'>
            <XCircle className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-2 text-lg font-medium'>Nenhuma reserva encontrada</h3>
            <p className='text-muted-foreground'>
              Você ainda não possui reservas {filtro !== 'todas' ? `com status "${filtro}"` : ''}.
            </p>
            <Button className='mt-4' onClick={() => (window.location.href = '/dashboard/eventos')}>
              Explorar eventos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
