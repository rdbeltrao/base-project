'use client'

import { Button } from '@test-pod/ui'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'

const eventosExemplo = [
  {
    id: 1,
    titulo: 'Workshop de Inovação',
    data: '15 Jul 2025',
    horario: '14:00 - 17:00',
    local: 'Auditório Principal',
    vagas: 45,
    vagasDisponiveis: 12,
    descricao:
      'Workshop focado em técnicas de inovação e design thinking para profissionais de todas as áreas.',
    imagem:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 2,
    titulo: 'Palestra: Tendências de Mercado',
    data: '22 Jul 2025',
    horario: '19:00 - 21:00',
    local: 'Sala de Conferências',
    vagas: 80,
    vagasDisponiveis: 35,
    descricao:
      'Palestra com especialistas do setor discutindo as principais tendências de mercado para os próximos anos.',
    imagem:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: 3,
    titulo: 'Networking: Profissionais de TI',
    data: '05 Ago 2025',
    horario: '18:00 - 20:00',
    local: 'Espaço Colaborativo',
    vagas: 60,
    vagasDisponiveis: 20,
    descricao:
      'Evento de networking exclusivo para profissionais da área de tecnologia da informação.',
    imagem:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
  },
]

export default function EventosPage() {
  const eventos = eventosExemplo

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Eventos</h1>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {eventos.map(evento => (
          <div key={evento.id} className='rounded-lg border bg-card overflow-hidden flex flex-col'>
            <div className='relative h-48'>
              <img src={evento.imagem} alt={evento.titulo} className='w-full h-full object-cover' />
            </div>
            <div className='p-4 flex-1 flex flex-col'>
              <h3 className='text-lg font-medium line-clamp-2'>{evento.titulo}</h3>

              <div className='mt-2 space-y-2 text-sm text-muted-foreground flex-1'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>{evento.data}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  <span>{evento.horario}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  <span>{evento.local}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  <span>{evento.vagasDisponiveis} vagas disponíveis</span>
                </div>

                <p className='line-clamp-2 mt-2'>{evento.descricao}</p>
              </div>

              <div className='mt-4 flex justify-end'>
                <Button>Ver detalhes</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {eventos.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>Nenhum evento encontrado.</p>
        </div>
      )}
    </div>
  )
}
