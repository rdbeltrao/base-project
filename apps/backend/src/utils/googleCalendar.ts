import { google } from 'googleapis'
import { User, Event, Reservation } from '@test-pod/database'

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const calendar = google.calendar('v3')

// OAuth2 client pool to prevent memory leaks
const clientPool: { [key: string]: any } = {}

function createOAuth2Client(accessToken: string, refreshToken?: string) {
  const clientKey = `${accessToken.substring(0, 10)}-${refreshToken?.substring(0, 10) || 'no-refresh'}`
  
  if (clientPool[clientKey]) {
    return clientPool[clientKey]
  }
  
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

  // Add to pool with TTL cleanup
  clientPool[clientKey] = oauth2Client
  
  // Clean up after 1 hour
  setTimeout(() => {
    delete clientPool[clientKey]
  }, 3600000)

  return oauth2Client
}

export async function addEventToGoogleCalendar(
  userId: number,
  eventId: string,
  reservationId: string
): Promise<string | null> {
  try {
    const user = await User.findByPk(userId)
    if (!user || !user.googleAccessToken) {
      return null
    }

    const event = await Event.findByPk(eventId)
    if (!event) {
      return null
    }

    const reservation = await Reservation.findByPk(reservationId)
    if (!reservation) {
      return null
    }

    const oauth2Client = createOAuth2Client(user.googleAccessToken, user.googleRefreshToken)

    const eventDate = new Date(event.eventDate)

    const formatDate = (date: Date) => {
      const pad = (num: number) => num.toString().padStart(2, '0')
      const year = date.getFullYear()
      const month = pad(date.getMonth() + 1)
      const day = pad(date.getDate())
      return `${year}-${month}-${day}`
    }

    // Fix date manipulation to avoid mutation and handle timezone issues
    const nextDay = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000)
    const nextNextDay = new Date(eventDate.getTime() + 2 * 24 * 60 * 60 * 1000)

    const googleEvent = {
      summary: event.name,
      calendarId: 'primary',
      description: event.description || `Reservation for ${event.name}`,
      start: {
        date: formatDate(nextDay),
      },
      end: {
        date: formatDate(nextNextDay),
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
      return response.data.id
    }

    return null
  } catch (_error) {
    return null
  }
}
export async function removeEventFromGoogleCalendar(
  userId: number,
  googleCalendarEventId: string
): Promise<boolean> {
  try {
    const user = await User.findByPk(userId)
    if (!user || !user.googleAccessToken) {
      return false
    }
    const oauth2Client = createOAuth2Client(user.googleAccessToken, user.googleRefreshToken)

    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: 'primary',
      eventId: googleCalendarEventId,
    })

    return true
  } catch (_error) {
    return false
  }
}

export async function refreshGoogleToken(userId: number): Promise<boolean> {
  try {
    const user = await User.findByPk(userId)
    if (!user || !user.googleRefreshToken) {
      return false
    }

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
