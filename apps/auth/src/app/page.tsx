export default function Index() {
  // This page is handled by middleware redirection
  // Users will be redirected to /dashboard if authenticated
  // or to /login if not authenticated
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Redirecionando...</p>
      </div>
    </div>
  )
}
