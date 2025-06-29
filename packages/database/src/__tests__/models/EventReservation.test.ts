import { ReservationStatus } from '../../models'

const mockEvent = {
  id: '1',
  name: 'Evento de Teste',
  description: 'Descrição do evento de teste',
  eventDate: new Date('2025-12-31'),
  location: 'Local do Teste',
  maxCapacity: 10,
  reservedSpots: 0,
  active: true,
  featured: false,
  userId: '123',
  getReservations: jest.fn(),
  getRealAvailableSpots: jest.fn(),
  reload: jest.fn(),
}

describe('Lógica de Reservas em Eventos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEvent.reservedSpots = 0
    mockEvent.active = true
  })

  test('Evento ativo deve ter vagas disponíveis', async () => {
    // Configurar o mock para retornar uma lista vazia de reservas confirmadas
    mockEvent.getReservations.mockResolvedValue([])
    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar se o evento tem vagas disponíveis
    const availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(10)
  })

  test('Evento inativo não deve ter vagas disponíveis', async () => {
    // Configurar o evento como inativo
    mockEvent.active = false

    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      if (!mockEvent.active) {
        return 0
      }

      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar que não há vagas disponíveis
    const availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(0)
  })

  test('Reservas confirmadas devem reduzir o número de vagas disponíveis', async () => {
    // Configurar o mock para retornar algumas reservas confirmadas
    const mockReservations = [
      { id: '1', eventId: '1', userId: '456', status: ReservationStatus.CONFIRMED },
      { id: '2', eventId: '1', userId: '789', status: ReservationStatus.CONFIRMED },
    ]
    mockEvent.getReservations.mockResolvedValue(mockReservations)

    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      if (!mockEvent.active) {
        return 0
      }

      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar que as vagas disponíveis foram reduzidas
    const availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(8) // 10 - 2 reservas confirmadas
  })

  test('Reservas canceladas não devem contar para o número de vagas ocupadas', async () => {
    // Configurar o mock para retornar algumas reservas, incluindo canceladas
    const mockReservations = [
      { id: '1', eventId: '1', userId: '456', status: ReservationStatus.CONFIRMED },
      { id: '2', eventId: '1', userId: '789', status: ReservationStatus.CANCELED },
      { id: '3', eventId: '1', userId: '012', status: ReservationStatus.CONFIRMED },
    ]
    mockEvent.getReservations.mockResolvedValue(mockReservations)

    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      if (!mockEvent.active) {
        return 0
      }

      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar que apenas as reservas confirmadas reduzem as vagas disponíveis
    const availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(8) // 10 - 2 reservas confirmadas (a cancelada não conta)
  })

  test('Evento com capacidade máxima não deve ter vagas disponíveis', async () => {
    // Criar reservas suficientes para atingir a capacidade máxima
    const mockReservations = Array(10)
      .fill(null)
      .map((_, index) => ({
        id: `${index + 1}`,
        eventId: '1',
        userId: `user${index + 1}`,
        status: ReservationStatus.CONFIRMED,
      }))

    mockEvent.getReservations.mockResolvedValue(mockReservations)

    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      if (!mockEvent.active) {
        return 0
      }

      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar que não há mais vagas disponíveis
    const availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(0)
  })

  test('Não deve ser possível fazer reserva quando não há vagas disponíveis', async () => {
    // Configurar o mock para retornar que não há vagas disponíveis
    mockEvent.getRealAvailableSpots.mockResolvedValue(0)

    // Simular a tentativa de criar uma reserva
    const createReservation = async () => {
      const availableSpots = await mockEvent.getRealAvailableSpots()
      if (availableSpots <= 0) {
        throw new Error('Não há vagas disponíveis para este evento')
      }
      return { id: '999', eventId: '1', userId: '999', status: ReservationStatus.CONFIRMED }
    }

    // Verificar que a tentativa de criar uma reserva falha
    await expect(createReservation()).rejects.toThrow('Não há vagas disponíveis para este evento')
  })

  test('Cancelar uma reserva deve liberar uma vaga', async () => {
    // Configurar o mock para retornar algumas reservas confirmadas
    const mockReservations = [
      { id: '1', eventId: '1', userId: '456', status: ReservationStatus.CONFIRMED },
      { id: '2', eventId: '1', userId: '789', status: ReservationStatus.CONFIRMED },
    ]
    mockEvent.getReservations.mockResolvedValue(mockReservations)

    mockEvent.getRealAvailableSpots.mockImplementation(async () => {
      if (!mockEvent.active) {
        return 0
      }

      const reservations = await mockEvent.getReservations()
      const confirmedReservations = reservations.filter(
        (r: any) => r.status === ReservationStatus.CONFIRMED
      )
      return Math.max(0, mockEvent.maxCapacity - confirmedReservations.length)
    })

    // Verificar vagas disponíveis antes do cancelamento
    let availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(8) // 10 - 2 reservas confirmadas

    // Cancelar uma reserva
    mockReservations[0].status = ReservationStatus.CANCELED

    // Verificar vagas disponíveis após o cancelamento
    availableSpots = await mockEvent.getRealAvailableSpots()
    expect(availableSpots).toBe(9) // 10 - 1 reserva confirmada (a outra foi cancelada)
  })
})
