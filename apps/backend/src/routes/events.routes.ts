import { Router } from 'express'
import { Event, User, Reservation, SessionUser } from '@test-pod/database'
import { authenticate, hasPermission } from '../middleware/auth.middleware'
import { Op } from '@test-pod/database/node_modules/sequelize'

const router: Router = Router()

// GET /events - List all events (filter by date, name, etc.)
router.get('/', authenticate, async (req, res) => {
  try {
    const { name, fromDate, toDate, active } = req.query

    // Build filter conditions
    const whereConditions: any = {}

    if (name) {
      whereConditions.name = { [Op.iLike]: `%${name}%` }
    }

    if (fromDate && toDate) {
      whereConditions.eventDate = {
        [Op.between]: [new Date(fromDate as string), new Date(toDate as string)],
      }
    } else if (fromDate) {
      whereConditions.eventDate = { [Op.gte]: new Date(fromDate as string) }
    } else if (toDate) {
      whereConditions.eventDate = { [Op.lte]: new Date(toDate as string) }
    }

    // Only show active events by default, unless specifically requested
    if (active !== undefined) {
      whereConditions.active = active === 'true'
    } else {
      whereConditions.active = true
    }

    const events = await Event.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['eventDate', 'ASC']],
    })

    // For each event, calculate real available spots
    const eventsWithRealSpots = await Promise.all(
      events.map(async event => {
        const realAvailableSpots = await event.getRealAvailableSpots()
        return {
          ...event.toJSON(),
          realAvailableSpots,
        }
      })
    )

    res.json(eventsWithRealSpots)
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ message: 'Error fetching events' })
  }
})

// GET /events/:id - Get details of a specific event
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    })

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Calculate real available spots
    const realAvailableSpots = await event.getRealAvailableSpots()

    res.json({
      ...event.toJSON(),
      realAvailableSpots,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({ message: 'Error fetching event' })
  }
})

// POST /events - Create a new event (admin only)
router.post('/', authenticate, hasPermission('event.create'), async (req, res) => {
  try {
    const { name, description, eventDate, location, onlineLink, maxCapacity } = req.body

    // Validate required fields
    if (!name || !eventDate || !maxCapacity) {
      return res.status(400).json({
        message: 'Name, event date, and maximum capacity are required',
      })
    }

    // Validate maxCapacity is positive
    if (maxCapacity <= 0) {
      return res.status(400).json({
        message: 'Maximum capacity must be greater than 0',
      })
    }

    // Create the event
    const event = await Event.create({
      name,
      description,
      eventDate: new Date(eventDate),
      location,
      onlineLink,
      maxCapacity,
      availableSpots: maxCapacity, // Initially all spots are available
      userId: (req.user as SessionUser).id.toString(),
      active: true,
    })

    res.status(201).json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ message: 'Error creating event' })
  }
})

// PUT /events/:id - Update an existing event (admin only)
router.put('/:id', authenticate, hasPermission('event.update'), async (req, res) => {
  try {
    const { name, description, eventDate, location, onlineLink, maxCapacity, active } = req.body

    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Validate maxCapacity if provided
    if (maxCapacity !== undefined && maxCapacity <= 0) {
      return res.status(400).json({
        message: 'Maximum capacity must be greater than 0',
      })
    }

    // Count confirmed reservations to ensure we don't reduce capacity below that
    if (maxCapacity !== undefined) {
      const confirmedReservations = await Reservation.count({
        where: {
          eventId: event.id,
          status: 'confirmed',
        },
      })

      if (maxCapacity < confirmedReservations) {
        return res.status(400).json({
          message: `Cannot reduce capacity below the number of confirmed reservations (${confirmedReservations})`,
        })
      }
    }

    // Update the event
    await event.update({
      name: name !== undefined ? name : event.name,
      description: description !== undefined ? description : event.description,
      eventDate: eventDate !== undefined ? new Date(eventDate) : event.eventDate,
      location: location !== undefined ? location : event.location,
      onlineLink: onlineLink !== undefined ? onlineLink : event.onlineLink,
      maxCapacity: maxCapacity !== undefined ? maxCapacity : event.maxCapacity,
      active: active !== undefined ? active : event.active,
    })

    // Recalculate available spots if maxCapacity changed
    if (maxCapacity !== undefined) {
      const confirmedReservations = await Reservation.count({
        where: {
          eventId: event.id,
          status: 'confirmed',
        },
      })

      await event.update({
        availableSpots: maxCapacity - confirmedReservations,
      })
    }

    res.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ message: 'Error updating event' })
  }
})

// DELETE /events/:id - Delete an event (admin only)
router.delete('/:id', authenticate, hasPermission('event.delete'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check if there are any reservations for this event
    const reservationsCount = await Reservation.count({
      where: { eventId: event.id },
    })

    if (reservationsCount > 0) {
      // Instead of deleting, just mark as inactive
      await event.update({ active: false })
      return res.json({
        message: 'Event has reservations and was marked as inactive instead of deleted',
      })
    }

    // If no reservations, we can safely delete
    await event.destroy()
    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ message: 'Error deleting event' })
  }
})

// GET /events/:id/reservations - List all reservations for a specific event (admin only)
router.get(
  '/:id/reservations',
  authenticate,
  hasPermission('reservation.manage'),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id)

      if (!event) {
        return res.status(404).json({ message: 'Event not found' })
      }

      const reservations = await Reservation.findAll({
        where: { eventId: event.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      })

      res.json(reservations)
    } catch (error) {
      console.error('Error fetching reservations:', error)
      res.status(500).json({ message: 'Error fetching reservations' })
    }
  }
)

export default router
