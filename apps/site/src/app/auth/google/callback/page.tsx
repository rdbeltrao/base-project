'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GoogleCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      return
    }

    // Store the token in localStorage
    localStorage.setItem('auth_token', token)

    // Redirect to home page or dashboard
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }, [router, searchParams])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        {status === 'loading' ? (
          <div className='text-center'>
            <h1 className='mb-4 text-2xl font-bold'>Autenticação bem-sucedida</h1>
            <p className='mb-4 text-gray-600'>Redirecionando para a página inicial...</p>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          </div>
        ) : (
          <div className='text-center'>
            <h1 className='mb-4 text-2xl font-bold text-red-600'>Erro de autenticação</h1>
            <p className='mb-4 text-gray-600'>
              Ocorreu um erro durante a autenticação com o Google.
            </p>
            <button
              onClick={() => router.push('/')}
              className='rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90'
            >
              Voltar para a página inicial
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
