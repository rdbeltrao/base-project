import { Metadata } from 'next'
import Link from 'next/link'

import Header from './components/Header'
import Footer from './components/Footer'
import EventCarousel from './components/EventCarousel'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Eventos - Plataforma de Eventos',
  description: 'A melhor plataforma para gerenciamento e reserva de eventos',
  openGraph: {
    title: 'Eventos - Plataforma de Eventos',
    description: 'A melhor plataforma para gerenciamento e reserva de eventos',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col justify-center">
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Eventos em Destaque</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Confira os eventos mais populares em nossa plataforma e não perca a oportunidade de participar.
              </p>
            </div>
            <EventCarousel />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
