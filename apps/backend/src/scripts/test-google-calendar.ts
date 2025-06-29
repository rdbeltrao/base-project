/**
 * Test script for Google Calendar integration
 *
 * This script tests the Google Calendar integration by:
 * 1. Creating a test event
 * 2. Creating a test reservation
 * 3. Adding the event to Google Calendar
 * 4. Removing the event from Google Calendar
 *
 * Usage:
 * - Set the USER_ID environment variable to a user ID with Google credentials
 * - Run with ts-node: npx ts-node src/scripts/test-google-calendar.ts
 */

import dotenv from 'dotenv'
dotenv.config()

import { User, Event, Reservation, ReservationStatus } from '@test-pod/database'
import { addEventToGoogleCalendar, removeEventFromGoogleCalendar } from '../utils/googleCalendar'

async function main() {
  try {
    // Get user ID from environment variable
    const userId = process.env.USER_ID ? parseInt(process.env.USER_ID) : null

    if (!userId) {
      console.error('Please set the USER_ID environment variable')
      process.exit(1)
    }

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      console.error(`User with ID ${userId} not found`)
      process.exit(1)
    }

    if (!user.googleAccessToken) {
      console.error(`User with ID ${userId} does not have Google credentials`)
      process.exit(1)
    }

    console.log(`Testing Google Calendar integration for user: ${user.name} (${user.email})`)
    
    // Create a test event
    const startDate = new Date()
    startDate.setHours(startDate.getHours() + 1)

    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 2)

    const testEvent = await Event.create({
      name: 'Test Event',
      description: 'This is a test event for Google Calendar integration',
      eventDate: startDate,
      location: 'Test Location',
      maxCapacity: 10,
      active: true,
      featured: false,
      userId: userId.toString(),
    })

    console.log(`Created test event: ${testEvent.name} (ID: ${testEvent.id})`)
    
    // Create a test reservation
    const testReservation = await Reservation.create({
      eventId: testEvent.id,
      userId: userId.toString(),
      status: ReservationStatus.CONFIRMED,
    })

    console.log(`Created test reservation: ID ${testReservation.id}`)

    // Add event to Google Calendar
    console.log('Adding event to Google Calendar...')
    const calendarEventId = await addEventToGoogleCalendar(userId, testEvent.id, testReservation.id)
    
    if (!calendarEventId) {
      console.error('Failed to add event to Google Calendar')
      await cleanup(testEvent.id, testReservation.id)
      process.exit(1)
    }

    console.log(`Successfully added event to Google Calendar: ${calendarEventId}`)

    // Update reservation with calendar event ID
    await testReservation.update({
      googleCalendarEventId: calendarEventId,
    })

    // Wait a bit to see the event in Google Calendar
    console.log('Waiting 5 seconds before removing the event...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Remove event from Google Calendar
    console.log('Removing event from Google Calendar...')
    await removeEventFromGoogleCalendar(userId, calendarEventId)
    console.log('Successfully removed event from Google Calendar')

    // Cleanup
    await cleanup(testEvent.id, testReservation.id)

    console.log('Test completed successfully!')
  } catch (error) {
    console.error('Error during test:', error)
    process.exit(1)
  }
}

async function cleanup(eventId: string, reservationId: string) {
  console.log('Cleaning up test data...')

  try {
    const reservation = await Reservation.findByPk(reservationId)
    if (reservation) {
      await reservation.destroy()
      console.log(`Deleted test reservation: ${reservationId}`)
    }

    const event = await Event.findByPk(eventId)
    if (event) {
      await event.destroy()
      console.log(`Deleted test event: ${eventId}`)
    }
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

main().catch(console.error)
