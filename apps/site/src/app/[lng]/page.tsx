// This page will likely be a server component as it was before.
// 'use client' should only be added if client-side hooks are directly used here.

import { Metadata } from 'next'; // Keep if used for this page's specific metadata
import Header from '../components/Header'; // Adjusted path
import Footer from '../components/Footer'; // Adjusted path
import EventCarousel from '../components/EventCarousel'; // Adjusted path
import { useTranslation } from '@test-pod/translation'; // Server-side hook

export const revalidate = 3600;

// Define the app-specific locale loader for site
// This function will be passed to useTranslation
const siteLocaleLoader = async (language, namespace) => {
  return import(`../../locales/${language}/${namespace}.json`);
};

// Metadata can also be dynamic and use translations
// export async function generateMetadata({ params }: { params: { lng: string } }): Promise<Metadata> {
//   const { t } = await useTranslation(params.lng, ['site', 'common'], {}, siteLocaleLoader);
//   return {
//     title: t('home.meta.title', { ns: 'site', defaultValue: "Events - Event Platform" }),
//     description: t('home.meta.description', { ns: 'site', defaultValue: "The best platform for event management and booking" }),
//     openGraph: {
//       title: t('home.meta.og.title', { ns: 'site', defaultValue: "Events - Event Platform" }),
//       description: t('home.meta.og.description', { ns: 'site', defaultValue: "The best platform for event management and booking" }),
//       images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }], // Adjust image path if needed
//       type: 'website',
//     },
//   };
// }
// For now, we'll let the [lng]/layout.tsx handle broader metadata.
// Page-specific metadata can override parts of it if needed.
// If this page component itself is a server component, it can fetch its own translations for metadata.

export default async function HomePage({ params: { lng } }: { params: { lng: string } }) {
  const { t } = await useTranslation(lng, ['site', 'common'], {}, siteLocaleLoader);

  return (
    <div className='min-h-screen flex flex-col'>
      <Header lng={lng} /> {/* Pass lng to Header if it needs to make lang-aware links or use translations */}

      <main className='flex-grow flex flex-col justify-center'>
        <section className='py-12 px-4'>
          <div className='container mx-auto max-w-6xl'>
            <div className='text-center mb-10'>
              <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                {t('home.featured_events.title', { ns: 'site', defaultValue: 'Featured Events' })}
              </h1>
              <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                {t('home.featured_events.subtitle', { ns: 'site', defaultValue: 'Check out the most popular events on our platform and don\'t miss the opportunity to participate.' })}
              </p>
            </div>
            <EventCarousel /> {/* EventCarousel might also need lng if it has text */}
          </div>
        </section>
      </main>

      <Footer lng={lng} /> {/* Pass lng to Footer for similar reasons */}
    </div>
  );
}
