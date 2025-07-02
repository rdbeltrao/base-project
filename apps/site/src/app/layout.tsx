// This is a minimal root layout for the 'site' app.
// The actual layout content including <html> and <body> is in app/[lng]/layout.tsx.
// This file is needed to satisfy Next.js's requirement for a root layout.

import { Inter } from 'next/font/google'; // Keep font import if used globally
import '@/styles/globals.css'; // Keep global styles

const inter = Inter({ subsets: ['latin'] }); // If used by [lng]/layout.tsx, it's fine here or pass it down

// Generic metadata, will be overridden by [lng]/layout.tsx
export const metadata = {
  title: 'Eventos - Plataforma de Eventos',
  description: 'Plataforma para reserva e gerenciamento de eventos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This layout just passes children through.
  // The <html> and <body> tags are rendered by app/[lng]/layout.tsx.
  // You could add global providers here if they don't depend on `lng`.
  return (
    <>
      {/* Apply global font class here if needed, or ensure [lng]/layout.tsx handles it */}
      {/* <main className={inter.className}>{children}</main> */}
      {/* It's usually better to apply className to body in the [lng]/layout */}
      {children}
    </>
  );
}
