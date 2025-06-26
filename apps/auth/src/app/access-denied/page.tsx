import { useAuth } from '@test-pod/auth-shared'
import { Button } from '@test-pod/ui'
import Head from 'next/head'

export default function AccessDenied() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`)
  }

  return (
    <>
      <Head>
        <title>Acesso Negado | Backoffice</title>
      </Head>
      <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
        <div className='w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm'>
          <div className='mb-6 flex flex-col items-center'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-destructive'
              >
                <path d='M18 6 6 18' />
                <path d='m6 6 12 12' />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-foreground'>Acesso Negado</h1>
          </div>

          <div className='mb-6 text-center text-muted-foreground'>
            <p className='mb-2'>Você não tem permissão para acessar o painel administrativo.</p>
          </div>

          <div className='flex flex-col gap-4'>
            <Button variant='destructive' onClick={handleLogout} className='w-full'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='mr-2'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
