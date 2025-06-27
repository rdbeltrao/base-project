'use client'

import { useAuth } from '@test-pod/auth-shared'
import { Button } from '@test-pod/ui'
import Head from 'next/head'
import { X, LogOut } from 'lucide-react'

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
              <X className='h-8 w-8 text-destructive' />
            </div>
            <h1 className='text-2xl font-bold text-foreground'>Acesso Negado</h1>
          </div>

          <div className='mb-6 text-center text-muted-foreground'>
            <p className='mb-2'>Você não tem permissão para acessar o painel administrativo.</p>
          </div>

          <div className='flex flex-col gap-4'>
            <Button variant='destructive' onClick={handleLogout} className='w-full'>
              <LogOut className='mr-2 h-4 w-4' />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
