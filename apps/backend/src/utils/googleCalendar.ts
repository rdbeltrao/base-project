import { google } from 'googleapis'
import { User, Event, Reservation } from '@test-pod/database'

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const calendar = google.calendar('v3')

/**
 * Creates an OAuth2 client with the given credentials
 * @param accessToken Google access token
 * @param refreshToken Google refresh token
 * @returns OAuth2 client
 */
function createOAuth2Client(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    scope: SCOPES.join(' '),
  })

  return oauth2Client
}

/**
 * Adds an event to the user's Google Calendar
 * @param userId User ID
 * @param eventId Event ID
 * @param reservationId Reservation ID
 * @returns Google Calendar event ID or null if failed
 */
export async function addEventToGoogleCalendar(
  userId: number,
  eventId: string,
  reservationId: string
): Promise<string | null> {
  try {
    // Get user with Google tokens
    const user = await User.findByPk(userId)
    if (!user || !user.googleAccessToken) {
      console.log('User not found or no Google access token')
      return null
    }

    // Get event details
    const event = await Event.findByPk(eventId)
    if (!event) {
      console.log('Event not found')
      return null
    }

    // Get reservation details
    const reservation = await Reservation.findByPk(reservationId)
    if (!reservation) {
      console.log('Reservation not found')
      return null
    }

    // Create OAuth2 client
    const oauth2Client = createOAuth2Client(
      user.googleAccessToken,
      user.googleRefreshToken
    )

    // Format event date for Google Calendar
    const eventDate = new Date(event.eventDate)
    // Set end time to 1 hour after start time by default
    const endDate = new Date(eventDate)
    endDate.setHours(endDate.getHours() + 1)

    // Create event in Google Calendar
    const googleEvent = {
      summary: event.name,
      description: event.description || `Reservation for ${event.name}`,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      location: event.location || event.onlineLink || '',
      attendees: [{ email: user.email }],
      reminders: {
        useDefault: true,
      },
    }

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: googleEvent,
    })

    if (response.data.id) {
      console.log(`Event created in Google Calendar: ${response.data.id}`)
      return response.data.id
    }

    return null
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error)
    return null
  }
}

/**
 * Removes an event from the user's Google Calendar
 * @param userId User ID
 * @param googleCalendarEventId Google Calendar event ID
 * @returns true if successful, false otherwise
 */
export async function removeEventFromGoogleCalendar(
  userId: number,
  googleCalendarEventId: string
): Promise<boolean> {
  try {
    // Get user with Google tokens
    const user = await User.findByPk(userId)
    if (!user || !user.googleAccessToken) {
      console.log('User not found or no Google access token')
      return false
    }

    // Create OAuth2 client
    const oauth2Client = createOAuth2Client(
      user.googleAccessToken,
      user.googleRefreshToken
    )

    // Delete event from Google Calendar
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: 'primary',
      eventId: googleCalendarEventId,
    })

    console.log(`Event removed from Google Calendar: ${googleCalendarEventId}`)
    return true
  } catch (error) {
    console.error('Error removing event from Google Calendar:', error)
    return false
  }
}

/**
 * Refreshes the user's Google access token if needed
 * @param userId User ID
 * @returns true if successful, false otherwise
 */
export async function refreshGoogleToken(userId: number): Promise<boolean> {
  try {
    const user = await User.findByPk(userId)
    if (!user || !user.googleRefreshToken) {
      return false
    }

    // Check if token needs refresh
    if (!user.googleTokenExpiry || new Date(user.googleTokenExpiry) <= new Date()) {
      const oauth2Client = createOAuth2Client('', user.googleRefreshToken)
      const { credentials } = await oauth2Client.refreshAccessToken()
      if (credentials.access_token) {
        await user.update({
          googleAccessToken: credentials.access_token,
          googleTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
        })
        return true
      }
    }
    return !!user.googleAccessToken
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return false
  }
}
