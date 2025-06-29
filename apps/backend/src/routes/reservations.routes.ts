import { Router } from 'express'
import { Event, User, Reservation, SessionUser, ReservationStatus } from '@test-pod/database'
import { authenticate } from '../middleware/auth.middleware'
import { userHasAllPermissions } from '../utils/permissions'
import { addEventToGoogleCalendar, removeEventFromGoogleCalendar } from '../utils/googleCalendar'

const router: Router = Router()

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id
    const userId = (req.user as SessionUser).id

    const reservation = await Reservation.findByPk(reservationId)

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }

    const hasPermissions = await userHasAllPermissions(userId, [
      'reservation.delete',
      'reservation.manage',
    ])

    if (reservation.userId !== userId && !hasPermissions) {
      return res.status(403).json({ message: 'You are not authorized to cancel this reservation' })
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      return res.status(400).json({ message: 'Reservation is already canceled' })
    }

    if (reservation.googleCalendarEventId) {
      try {
        await removeEventFromGoogleCalendar(userId, reservation.googleCalendarEventId)
      } catch (error) {
        console.error('Error removing event from Google Calendar:', error)
      }
    }

    await reservation.update({
      status: ReservationStatus.CANCELED,
      googleCalendarEventId: undefined,
    })

    res.json({ message: 'Reservation canceled successfully' })
  } catch (error) {
    console.error('Error canceling reservation:', error)
    res.status(500).json({ message: 'Error canceling reservation' })
  }
})

router.get('/mine', authenticate, async (req, res) => {
  try {
    const userId = (req.user as SessionUser).id

    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    res.status(500).json({ message: 'Error fetching reservations' })
  }
})

router.get('/event/:id', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = (req.user as SessionUser).id

    const reservation = await Reservation.findOne({
      where: {
        eventId,
        userId,
      },
    })

    if (!reservation) {
      return res.status(204)
    }

    res.json(reservation)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    res.status(500).json({ message: 'Error fetching reservation' })
  }
})

router.put('/:id/confirm', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id
    const userId = (req.user as SessionUser).id

    const reservation = await Reservation.findByPk(reservationId, {
      include: [{ model: Event, as: 'event' }],
    })

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }

    const isAdmin = await userHasAllPermissions(userId, [
      'reservation.confirm',
      'reservation.manage',
    ])

    if (reservation.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to confirm this reservation' })
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      return res.status(400).json({ message: 'Reservation is already confirmed' })
    }

    const { event } = reservation

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    if (event.reservedSpots >= event.maxCapacity) {
      return res.status(400).json({ message: 'No available spots for this event' })
    }

    await reservation.update({ status: ReservationStatus.CONFIRMED })

    try {
      const user = await User.findByPk(userId)
      if (user?.googleAccessToken) {
        const googleCalendarEventId = await addEventToGoogleCalendar(
          userId,
          event.id,
          reservation.id
        )
        if (googleCalendarEventId) {
          await reservation.update({ googleCalendarEventId })
        }
      }
    } catch (error) {
      console.error('Error adding event to Google Calendar:', error)
      // Continuar mesmo se falhar a adição ao Google Calendar
    }

    res.json({ message: 'Reservation confirmed successfully', reservation })
  } catch (error) {
    console.error('Error confirming reservation:', error)
    res.status(500).json({ message: 'Error confirming reservation' })
  }
})

export default router
