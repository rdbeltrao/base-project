'use client';

// This is a minimal root layout.
// The actual layout content is in app/[lng]/layout.tsx.
// This file is needed to satisfy Next.js's requirement for a root layout.

// Language detection and html attributes will be handled in app/[lng]/layout.tsx's client component

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang and dir will be set dynamically on the client side
    <html>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
