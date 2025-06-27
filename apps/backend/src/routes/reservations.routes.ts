import { Router } from 'express'
import { Event, User, Reservation, SessionUser, ReservationStatus } from '@test-pod/database'
import { authenticate } from '../middleware/auth.middleware'
import { userHasPermission } from '../utils/permissions'

const router: Router = Router()

// POST /events/:id/reserve - Make a reservation for an event (user only)
router.post('/events/:id/reserve', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = (req.user as SessionUser).id

    // Find the event
    const event = await Event.findByPk(eventId)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check if event is active
    if (!event.active) {
      return res.status(400).json({ message: 'This event is not active' })
    }

    // Check if user already has a confirmed reservation for this event
    const existingReservation = await Reservation.findOne({
      where: {
        eventId,
        userId,
        status: ReservationStatus.CONFIRMED,
      },
    })

    if (existingReservation) {
      return res.status(400).json({ message: 'You already have a reservation for this event' })
    }

    // Try to lock a spot for this reservation
    const spotLocked = await event.lockSpot()

    if (!spotLocked) {
      return res.status(400).json({ message: 'No available spots for this event' })
    }

    // Create the reservation
    try {
      const reservation = await Reservation.create({
        eventId,
        userId: userId.toString(),
        status: ReservationStatus.CONFIRMED,
      })

      res.status(201).json(reservation)
    } catch (error) {
      // If reservation creation fails, make sure to unlock the spot
      await event.unlockSpot()
      throw error
    }
  } catch (error) {
    console.error('Error creating reservation:', error)
    res.status(500).json({ message: 'Error creating reservation' })
  }
})

// DELETE /reservations/:id - Cancel a reservation (user only for their own reservation, or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id
    const userId = (req.user as SessionUser).id

    // Find the reservation
    const reservation = await Reservation.findByPk(reservationId, {
      include: [{ model: Event, as: 'event' }],
    })

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }

    // Check if user is authorized to cancel this reservation
    const isAdmin = await userHasPermission(userId, 'reservation.manage')

    if (reservation.userId !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to cancel this reservation' })
    }

    // Check if reservation is already canceled
    if (reservation.status === ReservationStatus.CANCELED) {
      return res.status(400).json({ message: 'Reservation is already canceled' })
    }

    // Update reservation status to canceled
    await reservation.update({ status: ReservationStatus.CANCELED })

    res.json({ message: 'Reservation canceled successfully' })
  } catch (error) {
    console.error('Error canceling reservation:', error)
    res.status(500).json({ message: 'Error canceling reservation' })
  }
})

// GET /my-reservations - List all reservations for the authenticated user
router.get('/my-reservations', authenticate, async (req, res) => {
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

export default router
