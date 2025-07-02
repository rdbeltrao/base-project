import '@/styles/globals.css';
import type { Metadata } from 'next'; // Keep this if you have specific metadata types
import { Inter } from 'next/font/google';
import { dir } from 'i18next';
import { languages, fallbackLng } from '@test-pod/translation/settings';
// We might need useTranslation here if metadata titles/descriptions are translated
// import { useTranslation } from '@test-pod/translation'; // Server-side
import { LanguageSwitcher } from '@test-pod/translation/components/LanguageSwitcher';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

// Updated to generate metadata dynamically
export async function generateMetadata({ params }: { params: { lng: string } }): Promise<Metadata> {
  // const { t } = await useTranslation(params.lng, 'site'); // Assuming 'site' namespace for titles
  // For now, simple dynamic title based on language. Replace with t('meta.title') etc.
  const title = params.lng === 'pt' ? 'Eventos PT - Plataforma de Eventos' : 'Events EN - Event Platform';
  const description = params.lng === 'pt' ? 'Plataforma para reserva e gerenciamento de eventos PT' : 'Platform for event booking and management EN';

  return {
    title: title,
    description: description,
    keywords: params.lng === 'pt' ? 'eventos, reservas, gerenciamento, plataforma' : 'events, bookings, management, platform',
    robots: 'index, follow',
    openGraph: {
      title: title,
      description: description,
      url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/${params.lng}` : undefined,
      siteName: params.lng === 'pt' ? 'Eventos' : 'Events',
      locale: params.lng === 'pt' ? 'pt_BR' : 'en_US',
      type: 'website',
    },
  };
}

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: { lng: string };
}>) {
  // Validate lng or use fallback
  const currentLng = languages.includes(lng) ? lng : fallbackLng;

  return (
    <html lang={currentLng} dir={dir(currentLng)}>
      <body className={inter.className} suppressHydrationWarning>
        {/* Language switcher can be placed in a global header or another shared spot */}
        {/* For this example, adding it simply at the top of the body for visibility */}
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '5px' }}>
          <LanguageSwitcher lng={currentLng} />
        </div>
        {children}
      </body>
    </html>
  );
}
