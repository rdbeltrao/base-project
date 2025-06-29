import { Router } from 'express'
import { Event, User, Reservation, SessionUser } from '@test-pod/database'
import { authenticate, hasPermission } from '../middleware/auth.middleware'
import { Sequelize } from '@test-pod/database'

const { Op } = Sequelize

const router: Router = Router()

const getImageUrl = async () => {
  const imageUrl = await fetch('https://picsum.photos/800/500')
  return imageUrl.url
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { name, fromDate, toDate, active } = req.query

    const whereConditions: any = {}

    if (name) {
      whereConditions.name = { [Op.iLike]: `%${name}%` }
    }

    // Com DATEONLY, podemos usar as strings de data diretamente
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
    console.log({ whereConditions })

    const events = await Event.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
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

    // Verificar se pelo menos um entre location e onlineLink está presente
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

export default router
