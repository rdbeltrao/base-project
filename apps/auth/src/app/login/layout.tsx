'use client';

// Removed metadata export as this is a 'use client' component.
// Title and metadata for this page can be set via the parent layout (if it's a server component)
// or client-side if this page needs dynamic titles.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
