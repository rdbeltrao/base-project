'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation'; // To get the current language

export default function HomePage() { // Renamed to avoid conflict if we have a server component Home
  const router = useRouter();
  const params = useParams();
  const lng = params.lng as string; // Get language from URL params

  useEffect(() => {
    if (lng) {
      router.push(`/${lng}/dashboard`);
    }
  }, [router, lng]);

  // Render nothing or a loading indicator while redirecting
  return null;
}
