import { AuthProvider } from '@test-pod/auth-shared'
import '@/styles/globals.css'
import { useTranslation } from '@test-pod/translation'
import { languages, fallbackLng } from '@test-pod/translation/settings'
import { BackofficeClient } from '../../components/backoffice-client'

const backofficeLocaleLoader = (language: string, namespace: string) => {
  return import(`../../locales/${language}/${namespace}.json`)
}

export async function generateStaticParams() {
  return languages.map((lng: string) => ({ lng }))
}

// Updated to generate metadata dynamically
export async function generateMetadata({ params }: { params: { lng: string } }) {
  // In a real app, you might fetch translations for title and description
  // For now, we'll keep it simple or use fixed values
  // const { t } = await useTranslation(params.lng, 'common'); // Example if using useTranslation here
  return {
    title: params.lng === 'pt' ? 'Backoffice PT' : 'Backoffice EN',
    description: params.lng === 'pt' ? 'Painel administrativo' : 'Admin panel',
  }
}

export default async function LngLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode
  params: { lng: string }
}) {
  // Validate lng or use fallback
  const currentLng = languages.includes(lng) ? lng : fallbackLng
  const { t } = await useTranslation(
    currentLng,
    ['common'],
    undefined,
    backofficeLocaleLoader,
  )

  const lsTranslations = {
    change_language: t('change_language'),
    en: t('en'),
    pt: t('pt'),
  }

  return (
    <BackofficeClient lng={currentLng} translations={lsTranslations}>
      {children}
    </BackofficeClient>
  )
} 