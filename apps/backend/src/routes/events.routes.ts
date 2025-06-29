import { Router } from 'express'
import { Event, User, Reservation, ReservationStatus, SessionUser } from '@test-pod/database'
import { authenticate, hasPermission } from '../middleware/auth.middleware'
import { addEventToGoogleCalendar } from '../utils/googleCalendar'
import { Sequelize } from '@test-pod/database'
import redisClient from '../config/redis.js'

const { Op } = Sequelize

const router: Router = Router()

const getImageUrl = async () => {
  const imageUrl = await fetch('https://picsum.photos/800/500')
  return imageUrl.url
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { name, fromDate, toDate, active, featured, limit = '10', offset = '0' } = req.query

    const parsedLimit = parseInt(limit as string, 10)
    const parsedOffset = parseInt(offset as string, 10)

    const whereConditions: any = {}

    if (name) {
      whereConditions.name = { [Op.iLike]: `%${name}%` }
    }

    if (fromDate && toDate) {
      whereConditions.eventDate = {
        [Op.between]: [fromDate, toDate],
      }
    } else if (fromDate) {
      whereConditions.eventDate = { [Op.gte]: fromDate }
    } else if (toDate) {
      whereConditions.eventDate = { [Op.lte]: toDate }
    }
    if (active !== undefined) {
      if (active) {
        whereConditions.active = active === 'true'
      } else {
        whereConditions.active = active === 'false'
      }
    }
    if (featured !== undefined) {
      whereConditions.featured = featured === 'true'
    }

    const { rows: events, count: total } = await Event.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [
        ['eventDate', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parsedLimit,
      offset: parsedOffset,
    })

    const eventsWithRealSpots = await Promise.all(
      events.map(async event => {
        const realAvailableSpots = await event.getRealAvailableSpots()
        return {
          ...event.toJSON(),
          realAvailableSpots,
        }
      })
    )

    res.json({
      events: eventsWithRealSpots,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: total > parsedOffset + parsedLimit,
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ message: 'Error fetching events' })
  }
})

router.get('/public', async (req, res) => {
  try {
    const CACHE_KEY = 'featured_events'
    const CACHE_TTL = 60 * 60 * 24

    const cachedEvents = await redisClient.get(CACHE_KEY)

    if (cachedEvents) {
      return res.json(JSON.parse(cachedEvents))
    }

    const events = await Event.findAll({
      where: {
        featured: true,
        active: true,
        eventDate: {
          [Op.gte]: new Date(),
        },
      },
      order: [['eventDate', 'ASC']],
      limit: 3,
    })

    await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(events))

    res.json(events)
  } catch (error) {
    console.error('Error fetching featured events:', error)
    res.status(500).json({ message: 'Error fetching featured events' })
  }
})

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

router.post('/', authenticate, hasPermission('event.manage'), async (req, res) => {
  try {
    const { name, description, eventDate, location, onlineLink, maxCapacity } = req.body

    const imageUrl = await getImageUrl()

    if (!name || !eventDate || !maxCapacity) {
      return res.status(400).json({
        message: 'Name, event date, and maximum capacity are required',
      })
    }

    if (!location && !onlineLink) {
      return res.status(400).json({
        message: 'Pelo menos um entre location e onlineLink deve ser fornecido',
      })
    }

    if (maxCapacity <= 0) {
      return res.status(400).json({
        message: 'Maximum capacity must be greater than 0',
      })
    }

    const event = await Event.create({
      name,
      description,
      eventDate: new Date(eventDate),
      location,
      onlineLink,
      imageUrl,
      maxCapacity,
      userId: (req.user as SessionUser).id.toString(),
      active: true,
    })

    if (req.body.featured) {
      await redisClient.del('featured_events')
    }

    res.status(201).json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ message: 'Error creating event' })
  }
})

router.put('/:id', authenticate, hasPermission('event.manage'), async (req, res) => {
  try {
    const { name, description, eventDate, location, onlineLink, maxCapacity, active } = req.body

    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    if (maxCapacity !== undefined && maxCapacity <= 0) {
      return res.status(400).json({
        message: 'Maximum capacity must be greater than 0',
      })
    }

    const updatedLocation = location !== undefined ? location : event.location
    const updatedOnlineLink = onlineLink !== undefined ? onlineLink : event.onlineLink

    if (!updatedLocation && !updatedOnlineLink) {
      return res.status(400).json({
        message: 'Pelo menos um entre location e onlineLink deve ser fornecido',
      })
    }

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

    await event.update({
      name: name !== undefined ? name : event.name,
      description: description !== undefined ? description : event.description,
      eventDate: eventDate !== undefined ? new Date(eventDate) : event.eventDate,
      location: location !== undefined ? location : event.location,
      onlineLink: onlineLink !== undefined ? onlineLink : event.onlineLink,
      maxCapacity: maxCapacity !== undefined ? maxCapacity : event.maxCapacity,
      active: active !== undefined ? active : event.active,
      featured: req.body.featured !== undefined ? req.body.featured : event.featured,
    })

    res.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ message: 'Error updating event' })
  }
})

router.delete('/:id', authenticate, hasPermission('event.delete'), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const reservationsCount = await Reservation.count({
      where: { eventId: event.id },
    })

    if (reservationsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete event with active reservations. Cancel all reservations first.',
      })
    }

    await event.update({ active: false })

    if (event.featured) {
      await redisClient.del('featured_events')
    }

    res.json({ message: 'Event deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating event:', error)
    res.status(500).json({ message: 'Error deactivating event' })
  }
})

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

router.post('/:id/reserve', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id
    const userId = (req.user as SessionUser).id

    const event = await Event.findByPk(eventId)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    if (!event.active) {
      return res.status(400).json({ message: 'This event is not active' })
    }

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

    const reservation = await Reservation.create({
      eventId,
      userId: userId.toString(),
      status: ReservationStatus.CONFIRMED,
    })

    // Check if user has Google account connected and add event to their calendar
    try {
      const user = await User.findByPk(userId)
      if (user?.googleAccessToken) {
        const googleCalendarEventId = await addEventToGoogleCalendar(
          userId,
          eventId,
          reservation.id
        )
        if (googleCalendarEventId) {
          await reservation.update({ googleCalendarEventId })
        }
      }
    } catch (error) {
      console.error('Error adding event to Google Calendar:', error)
      // Continue with reservation creation even if Google Calendar fails
    }

    res.status(201).json(reservation)
  } catch (error) {
    console.error('Error creating reservation:', error)
    res.status(500).json({ message: 'Error creating reservation' })
  }
})

router.post('/:id/feature', authenticate, hasPermission('event.manage'), async (req, res) => {
  try {
    const eventId = req.params.id

    const event = await Event.findByPk(eventId)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const { featured = !event.featured } = req.body

    await event.update({ featured })

    await redisClient.del('featured_events')

    res.json({
      message: `Event ${featured ? 'marked as featured' : 'removed from featured'}`,
      event: {
        id: event.id,
        name: event.name,
        featured: event.featured,
      },
    })
  } catch (error) {
    console.error('Error updating event feature status:', error)
    res.status(500).json({ message: 'Error updating event feature status' })
  }
})

export default router
