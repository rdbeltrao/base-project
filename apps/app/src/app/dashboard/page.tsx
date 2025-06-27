'use client'

import { Button } from '@test-pod/ui'
import Link from 'next/link'
import { Calendar, Ticket, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Dados de exemplo para eventos em destaque
const eventosDestaque = [
  {
    id: 1,
    titulo: 'Workshop de Inovação',
    data: '15 Jul 2025',
    horario: '14:00 - 17:00',
    local: 'Auditório Principal',
    imagem:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 2,
    titulo: 'Palestra: Tendências de Mercado',
    data: '22 Jul 2025',
    horario: '19:00 - 21:00',
    local: 'Sala de Conferências',
    imagem:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
]

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard/events')
  }, [])

  return (
    <div className='space-y-8'>
      <section>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Eventos em Destaque</h2>
          <Link
            href='/dashboard/events'
            className='flex items-center text-primary text-sm font-medium hover:underline'
          >
            Ver todos
            <ArrowRight className='ml-1 h-4 w-4' />
          </Link>
        </div>

        <div className='mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-2'>
          {eventosDestaque.map(evento => (
            <div
              key={evento.id}
              className='rounded-lg border bg-card overflow-hidden flex flex-col'
            >
              <div className='relative h-48'>
                <img
                  src={evento.imagem}
                  alt={evento.titulo}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='p-4 flex-1 flex flex-col'>
                <h3 className='text-lg font-medium'>{evento.titulo}</h3>

                <div className='mt-2 space-y-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {evento.data} • {evento.horario}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span>{evento.local}</span>
                  </div>
                </div>

                <div className='mt-4 flex justify-end'>
                  <Button>Reservar</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Minhas Reservas</h2>
          <Link
            href='/dashboard/reservas'
            className='flex items-center text-primary text-sm font-medium hover:underline'
          >
            Ver todas
            <ArrowRight className='ml-1 h-4 w-4' />
          </Link>
        </div>

        <div className='mt-4 flex items-center justify-center p-12 border rounded-lg bg-card'>
          <div className='text-center'>
            <Ticket className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-2 text-lg font-medium'>Nenhuma reserva ativa</h3>
            <p className='text-muted-foreground'>Você ainda não possui reservas para eventos.</p>
            <Button className='mt-4' onClick={() => router.push('/dashboard/events')}>
              Explorar eventos
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
