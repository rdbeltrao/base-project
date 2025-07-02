'use client'

import {
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@test-pod/ui'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@test-pod/auth-shared'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useGoogleConfig } from '../hooks/useGoogleConfig'

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z
      .string()
      .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
      .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof registerSchema>

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isGoogleEnabled, isLoading: isLoadingGoogleConfig } = useGoogleConfig()

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { login } = useAuth()

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setError('')

    try {
      // Registrar o usuário com tipo 'user' por padrão
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          type: 'user', // Definindo o tipo como 'user' por padrão
        }),
        credentials: 'include', // Para incluir cookies na resposta
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Login automático após o registro bem-sucedido
      const loginResult = await login(values.email, values.password)

      if (!loginResult.success) {
        throw new Error(loginResult.error || 'Automatic login failed')
      }

      // Redirecionar de acordo com o resultado do login
      if (loginResult.redirectUrl) {
        window.location.href = loginResult.redirectUrl
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-6 shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-foreground'>Create an account</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Fill out the form below to create your account
          </p>
        </div>

        {error && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>{error}</div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' type='text' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='you@example.com'
                      type='email'
                      autoComplete='email'
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>

        {isLoadingGoogleConfig && (
          <div className='relative my-4'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-card px-2 text-muted-foreground'>Loading...</span>
            </div>
          </div>
        )}

        {isGoogleEnabled && !isLoadingGoogleConfig && (
          <>
            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-card px-2 text-muted-foreground'>Or continue with</span>
              </div>
            </div>
            <GoogleLoginButton className='w-full' />
          </>
        )}

        <div className='mt-4 text-center text-sm'>
          <p>
            Already have an account?{' '}
            <Link href='/login' className='text-primary hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
