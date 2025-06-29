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

    // Extrair parâmetros de filtro de data
    const { startDate, endDate } = req.query;
    
    console.log('Filtros de data recebidos no backend:', { startDate, endDate });
    
    // Construir condição de filtro por data
    const whereCondition: any = {
      active: true,
    };
    
    // Adicionar filtro de data se ambos startDate e endDate estiverem presentes
    if (startDate && endDate) {
      // Criar datas com o horário ajustado para o início e fim do dia
      const startDateObj = new Date(`${startDate as string}T00:00:00`);
      // Definir o horário para 23:59:59 para incluir todo o dia final
      const endDateObj = new Date(`${endDate as string}T23:59:59`);
      
      console.log('Filtrando eventos entre:', { 
        startDate: startDateObj.toISOString(), 
        endDate: endDateObj.toISOString() 
      });
      
      whereCondition.eventDate = {
        [Op.between]: [startDateObj, endDateObj]
      };
    }
    
    // Buscar eventos com suas reservas
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

    // Agregar dados por data
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

    // Converter para array e ordenar por data
    const chartData = Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        eventNames: data.events.join(', '),
        totalSpots: data.totalSpots,
        reservedSpots: data.reservedSpots,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calcular totais
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
