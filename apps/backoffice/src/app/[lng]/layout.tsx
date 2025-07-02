import { AuthProvider } from '@test-pod/auth-shared';
import '@/styles/globals.css';
import { dir } from 'i18next';
import { languages, fallbackLng } from '@test-pod/translation/settings';
import { LanguageSwitcher } from '@test-pod/translation/components/LanguageSwitcher';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

// export const metadata = { // Metadata might need to be dynamic based on language
//   title: 'Backoffice',
//   description: 'Painel administrativo',
// };

// Updated to generate metadata dynamically
export async function generateMetadata({ params }: { params: { lng: string } }) {
  // In a real app, you might fetch translations for title and description
  // For now, we'll keep it simple or use fixed values
  // const { t } = await useTranslation(params.lng, 'common'); // Example if using useTranslation here
  return {
    title: params.lng === 'pt' ? 'Backoffice PT' : 'Backoffice EN',
    description: params.lng === 'pt' ? 'Painel administrativo' : 'Admin panel',
  };
}


export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const cookieNameEnv = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'; // Renamed to avoid conflict with settings cookieName

  // Validate lng or use fallback
  const currentLng = languages.includes(lng) ? lng : fallbackLng;

  return (
    <html lang={currentLng} dir={dir(currentLng)}>
      <body suppressHydrationWarning>
        <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieNameEnv}>
          <header className="p-4 bg-background border-b">
            <div className="container mx-auto flex justify-between items-center">
              <div>{/* Placeholder for potential logo or nav */}</div>
              <LanguageSwitcher lng={currentLng} />
            </div>
          </header>
          <main className="p-4"> {/* Add padding or other layout structure as needed */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
