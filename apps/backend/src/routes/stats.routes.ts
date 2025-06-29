import { Router } from 'express'
import { Event, Reservation, ReservationStatus, Sequelize } from '@test-pod/database'
import { authenticate } from '../middleware/auth.middleware'
import { userHasPermission } from '../utils/permissions'
import { SessionUser } from '@test-pod/database'

const { Op } = Sequelize

const router: Router = Router()

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = (req.user as SessionUser).id
    const isAdmin = await userHasPermission(userId, 'event.manage')

    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { startDate, endDate } = req.query

    const whereCondition: any = {
      active: true,
    }

    if (startDate && endDate) {
      const startDateObj = new Date(`${startDate as string}T00:00:00`)
      const endDateObj = new Date(`${endDate as string}T23:59:59`)

      whereCondition.eventDate = {
        [Op.between]: [startDateObj, endDateObj],
      }
    }

    const events = await Event.findAll({
      where: whereCondition,
      include: [
        {
          model: Reservation,
          as: 'reservations',
          where: {
            status: ReservationStatus.CONFIRMED,
          },
          required: false,
        },
      ],
      order: [['eventDate', 'ASC']],
    })

    const dataMap = new Map<
      string,
      { totalSpots: number; reservedSpots: number; events: string[] }
    >()

    events.forEach((event: any) => {
      const date = new Date(event.eventDate).toISOString().split('T')[0]
      const confirmedReservations = event.reservations?.length || 0

      if (dataMap.has(date)) {
        const existing = dataMap.get(date)!
        existing.totalSpots += event.maxCapacity
        existing.reservedSpots += confirmedReservations
        existing.events.push(event.name)
      } else {
        dataMap.set(date, {
          totalSpots: event.maxCapacity,
          reservedSpots: confirmedReservations,
          events: [event.name],
        })
      }
    })

    const chartData = Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        eventNames: data.events.join(', '),
        totalSpots: data.totalSpots,
        reservedSpots: data.reservedSpots,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalSpots = events.reduce((sum, event) => sum + event.maxCapacity, 0)
    const totalReserved = chartData.reduce((sum, data) => sum + data.reservedSpots, 0)

    res.json({
      chartData,
      summary: {
        totalSpots,
        totalReserved,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Error fetching dashboard statistics' })
  }
})

export default router
