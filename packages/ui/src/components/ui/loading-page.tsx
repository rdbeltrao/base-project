const LoadingPage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-2'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
        <p className='text-sm text-muted-foreground'>Carregando...</p>
      </div>
    </div>
  )
}

export { LoadingPage }
