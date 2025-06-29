'use client'

import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Input,
  Textarea,
  Switch,
  DateTimePicker,
} from '@test-pod/ui'
import type { EventAttributes as Event } from '@test-pod/database'

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  eventDate: z.date({
    required_error: 'Event date is required',
  }),
  location: z.string().optional(),
  onlineLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  event?: Event | null
  onSubmit: () => void
}

export default function EventForm({ event, onSubmit }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with default values or event data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: event?.name || '',
      description: event?.description || '',
      eventDate: event ? new Date(event.eventDate) : new Date(),
      location: event?.location || '',
      onlineLink: event?.onlineLink || '',
      maxCapacity: event?.maxCapacity || 10,
      active: event ? event.active : true,
      featured: event ? event.featured : false,
    },
  })

  const handleSubmit: SubmitHandler<FormValues> = async values => {
    try {
      setLoading(true)
      setError(null)

      // Garantir que maxCapacity tenha um valor válido
      const formData = {
        ...values,
        maxCapacity: values.maxCapacity || 10, // Valor padrão se não estiver definido
      }

      const url = event ? `/api/events/${event.id}` : '/api/events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save event')
      }

      // Call the onSubmit callback to refresh the event list
      onSubmit()
    } catch (err: any) {
      console.error('Error saving event:', err)
      setError(err.message || 'Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter event name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter event description' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='eventDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    className='flex-col'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='maxCapacity'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Capacity</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    placeholder='Enter maximum capacity'
                    {...field}
                    onChange={e => {
                      const value = parseInt(e.target.value)
                      field.onChange(isNaN(value) ? 1 : value)
                    }}
                    value={field.value || 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Physical location (optional)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='onlineLink'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Online Link</FormLabel>
                <FormControl>
                  <Input placeholder='https://meeting.url (optional)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='active'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Active Status</FormLabel>
                <div className='text-sm text-muted-foreground'>
                  {field.value
                    ? 'Event is active and visible to users'
                    : 'Event is inactive and hidden from users'}
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='featured'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Featured Event</FormLabel>
                <div className='text-sm text-muted-foreground'>
                  {field.value
                    ? 'Event will be highlighted on the homepage'
                    : 'Event will not be featured on the homepage'}
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-4'>
          <Button type='button' variant='outline' onClick={onSubmit}>
            Cancel
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
