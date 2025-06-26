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
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type ProfileFormValues = {
  name: string
  email: string
}

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout, updateProfile } = useAuth()
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
      updateProfile(data)
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

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='mt-4 text-sm text-muted-foreground'>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <header className='border-b border-border'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='text-xl font-bold text-foreground'>Auth App</div>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-muted-foreground'>
              Bem-vindo, {user.name || user.email}
            </span>
            <Button variant='outline' onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className='container mx-auto flex-1 px-4 py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-foreground'>Dashboard</h1>
        </div>

        {saveSuccess && (
          <div className='mb-4 rounded-md bg-green-500/15 p-3 text-sm text-green-600'>
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-lg border border-border bg-card p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-foreground'>Seu Perfil</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' size='sm'>
                    Editar Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                      Atualize suas informações de perfil abaixo.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
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

                      {saveError && <p className='text-sm text-red-500'>{saveError}</p>}

                      <DialogFooter>
                        <Button type='submit' disabled={isSaving}>
                          {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className='mt-4 space-y-4'>
              <div className='grid grid-cols-1 gap-1'>
                <span className='text-sm font-medium text-muted-foreground'>Nome</span>
                <span className='text-foreground'>{user.name || 'Não informado'}</span>
              </div>
              <div className='grid grid-cols-1 gap-1'>
                <span className='text-sm font-medium text-muted-foreground'>Email</span>
                <span className='text-foreground'>{user.email}</span>
              </div>
              {user.image && (
                <div className='grid grid-cols-1 gap-1'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Imagem de Perfil
                  </span>
                  <div className='h-20 w-20 overflow-hidden rounded-full'>
                    <img
                      src={user.image}
                      alt={user.name || 'Perfil'}
                      className='h-full w-full object-cover'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className='border-t border-border py-6 text-center text-sm text-muted-foreground'>
        <div className='container mx-auto px-4'>
          &copy; {new Date().getFullYear()} Auth App. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
