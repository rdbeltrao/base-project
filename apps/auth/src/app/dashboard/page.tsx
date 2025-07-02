'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

type ProfileFormValues = {
  name: string
  email: string
}

export default function Dashboard() {
  const { user, setUser } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user, form])

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveSuccess])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: data.name }),
        credentials: 'include',
      })

      if (!response.ok) {
        const responseData = await response.json()
        try {
          const errorData = responseData
          throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
        } catch (_) {
          throw new Error(responseData.error || `Erro ${response.status}: ${response.statusText}`)
        }
      }

      const responseJson = await response.json()

      setUser(responseJson.user)

      setSaveSuccess(true)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      setSaveError(
        error instanceof Error ? error.message : 'Erro ao salvar as alterações. Tente novamente.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {saveSuccess && (
        <div className='mb-4 rounded-md bg-green-500/15 p-3 text-sm text-green-600'>
          Perfil atualizado com sucesso!
        </div>
      )}

      <div className='grid gap-6 pb-6 md:grid-cols-2 sm:grid-cols-1'>
        <div className='rounded-lg border border-border bg-card p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-medium'>Informações do Perfil</h2>
          <div className='space-y-2'>
            <div>
              <span className='text-sm font-medium text-muted-foreground'>Nome:</span>
              <p>{user?.name || 'Não informado'}</p>
            </div>
            <div>
              <span className='text-sm font-medium text-muted-foreground'>Email:</span>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          <div className='mt-4'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Editar Perfil</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>Atualize suas informações de perfil abaixo.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder='Seu nome' {...field} />
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
                              type='email'
                              placeholder='seu.email@exemplo.com'
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {saveError && (
                      <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                        {saveError}
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type='submit' disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}
