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
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@test-pod/auth-shared'

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
})

type FormValues = z.infer<typeof loginSchema>

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  })

  const { login } = useAuth()

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await login(values.email, values.password)

      if (!result.success) {
        setError(result.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (_error) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-6 shadow-md'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-foreground'>Sign in to your account</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Enter your credentials below to access your account
          </p>
        </div>

        {error && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>{error}</div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
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
                    <Input type='password' autoComplete='current-password' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>

        <div className='mt-4 text-center text-sm'>
          <p>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='text-primary hover:underline'>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
