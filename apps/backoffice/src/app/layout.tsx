// This is a minimal root layout.
// The actual layout content is in app/[lng]/layout.tsx.
// This file is needed to satisfy Next.js's requirement for a root layout.

export const metadata = {
  title: 'Backoffice', // Generic title, will be overridden by [lng] layout
  description: 'Painel administrativo', // Generic description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The html and body tags are rendered by app/[lng]/layout.tsx
    // This layout just passes children through.
    <>
      {children}
    </>
  );
}
