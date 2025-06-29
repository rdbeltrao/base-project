import Event from '../../models/Event'
import User from '../../models/User'
import Reservation, { ReservationStatus } from '../../models/Reservation'

describe('Reservation', () => {
  let testUser: User
  let testEvent: Event

  beforeEach(async () => {
    // Criar usuário para os testes
    testUser = await User.create({
      name: 'Reservation Test User',
      email: `reservation.test${Date.now()}@example.com`,
      password: '123456',
      active: true,
    })

    // Criar evento para os testes
    testEvent = await Event.create({
      name: 'Reservation Test Event',
      description: 'Event for testing reservations',
      eventDate: new Date('2025-12-31'),
      location: 'Test Location',
      maxCapacity: 10,
      userId: testUser.id,
    })
  })

  // A conexão é fechada automaticamente pelo jest.setup.ts

  it('should create a reservation', async () => {
    const reservation = await Reservation.create({
      eventId: testEvent.id,
      userId: testUser.id,
    })

    expect(reservation).toBeDefined()
    expect(reservation.id).toBeDefined()
    expect(reservation.eventId).toBe(testEvent.id)
    expect(reservation.userId).toBe(testUser.id)
    expect(reservation.status).toBe(ReservationStatus.CONFIRMED)
    expect(reservation.reservationDate).toEqual(expect.any(Date))
  })

  it('should update event available spots when reservation is created', async () => {
    // Verificar spots disponíveis antes da reserva
    const availableSpotsBefore = await testEvent.getRealAvailableSpots()

    // Criar uma nova reserva
    await Reservation.create({
      eventId: testEvent.id,
      userId: (
        await User.create({
          name: 'Another User',
          email: 'another.user@example.com',
          password: '123456',
        })
      ).id,
    })

    // Recarregar o evento para obter os dados atualizados
    await testEvent.reload()

    // Verificar spots disponíveis após a reserva
    const availableSpotsAfter = await testEvent.getRealAvailableSpots()

    expect(availableSpotsAfter).toBe(availableSpotsBefore - 1)
  })

  it('should not allow reservation when event is at full capacity', async () => {
    // Criar um evento com capacidade limitada
    const smallEvent = await Event.create({
      name: 'Small Event',
      description: 'Event with limited capacity',
      eventDate: new Date('2025-12-31'),
      location: 'Small Venue',
      maxCapacity: 1,
      userId: testUser.id,
    })

    // Fazer uma reserva para ocupar toda a capacidade
    await Reservation.create({
      eventId: smallEvent.id,
      userId: testUser.id,
    })

    // Tentar fazer outra reserva
    const anotherUser = await User.create({
      name: 'Capacity Test User',
      email: 'capacity.test@example.com',
      password: '123456',
    })

    // Verificar se não há mais vagas disponíveis
    const availableSpots = await smallEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(0)

    // Tentar fazer uma reserva quando não há mais vagas deve falhar
    if (availableSpots === 0) {
      // Não permitir a criação da reserva
      await expect(async () => {
        await Reservation.create({
          eventId: smallEvent.id,
          userId: anotherUser.id,
        })
      }).rejects.toThrow()
    }
  })

  it('should allow canceling a reservation', async () => {
    // Criar uma reserva
    const reservation = await Reservation.create({
      eventId: testEvent.id,
      userId: (
        await User.create({
          name: 'Cancel Test User',
          email: 'cancel.test@example.com',
          password: '123456',
        })
      ).id,
    })

    // Verificar spots disponíveis antes do cancelamento
    const availableSpotsBefore = await testEvent.getRealAvailableSpots()

    // Cancelar a reserva
    reservation.status = ReservationStatus.CANCELED
    await reservation.save()

    // Verificar spots disponíveis após o cancelamento
    const availableSpotsAfter = await testEvent.getRealAvailableSpots()

    expect(availableSpotsAfter).toBe(availableSpotsBefore + 1)
    expect(reservation.status).toBe(ReservationStatus.CANCELED)
  })

  it('should not allow duplicate reservations for the same user and event', async () => {
    // Criar um novo usuário e evento para este teste
    const uniqueUser = await User.create({
      name: 'Unique User',
      email: 'unique.user@example.com',
      password: '123456',
    })

    const uniqueEvent = await Event.create({
      name: 'Unique Event',
      description: 'Event for testing unique reservations',
      eventDate: new Date('2025-12-31'),
      location: 'Unique Location',
      maxCapacity: 5,
      userId: testUser.id,
    })

    // Criar a primeira reserva
    await Reservation.create({
      eventId: uniqueEvent.id,
      userId: uniqueUser.id,
    })

    // Tentar criar uma segunda reserva para o mesmo usuário e evento
    await expect(
      Reservation.create({
        eventId: uniqueEvent.id,
        userId: uniqueUser.id,
      })
    ).rejects.toThrow()
  })

  it('should not allow reservations for inactive events', async () => {
    // Criar um evento inativo
    const inactiveEvent = await Event.create({
      name: 'Inactive Event',
      description: 'This event is inactive',
      eventDate: new Date('2025-12-31'),
      location: 'Inactive Location',
      maxCapacity: 10,
      active: false,
      userId: testUser.id,
    })

    // Verificar que não há vagas disponíveis
    const availableSpots = await inactiveEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(0)

    // Tentar fazer uma reserva para um evento inativo
    const user = await User.create({
      name: 'Inactive Test User',
      email: 'inactive.test@example.com',
      password: '123456',
    })

    if (availableSpots === 0) {
      // Não permitir a criação da reserva
      await expect(async () => {
        await Reservation.create({
          eventId: inactiveEvent.id,
          userId: user.id,
        })
      }).rejects.toThrow()
    }
  })
})
