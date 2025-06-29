import Event from '../../models/Event'
import User from '../../models/User'

describe('Event', () => {
  let testUser: User

  // Criar um usuário antes de cada teste
  beforeEach(async () => {
    testUser = await User.create({
      name: 'Event Test User',
      email: 'event.test@example.com',
      password: '123456',
      active: true,
    })
  })

  it('should create an event', async () => {
    const eventData = {
      name: 'Test Event',
      description: 'Test Description',
      eventDate: new Date('2025-12-30'),
      location: 'Test Location',
      maxCapacity: 100,
      userId: testUser.id.toString(),
    }

    const event = await Event.create(eventData)

    expect(event).toBeDefined()
    expect(event.id).toBeDefined()
    expect(event.name).toBe(eventData.name)
    expect(event.description).toBe(eventData.description)
    expect(typeof event.eventDate === 'string' || event.eventDate instanceof Date).toBe(true)
    expect(event.location).toBe(eventData.location)
    expect(event.maxCapacity).toBe(eventData.maxCapacity)
    expect(event.reservedSpots).toBe(0)
    expect(event.active).toBe(true)
    expect(event.featured).toBe(false)
    expect(event.userId).toBe(testUser.id)
  })

  it('should validate that location or onlineLink is provided', async () => {
    const eventData = {
      name: 'Invalid Event',
      description: 'This event has no location or online link',
      eventDate: new Date('2025-12-31'),
      maxCapacity: 100,
      userId: testUser.id.toString(),
    }

    await expect(Event.create(eventData)).rejects.toThrow(
      'Pelo menos um entre location e onlineLink deve ser fornecido'
    )
  })

  it('should validate maxCapacity is at least 1', async () => {
    const eventData = {
      name: 'Invalid Capacity Event',
      description: 'This event has invalid capacity',
      eventDate: new Date('2025-12-31'),
      location: 'Test Location',
      maxCapacity: 0,
      userId: testUser.id.toString(),
    }

    await expect(Event.create(eventData)).rejects.toThrow()
  })

  it('should get real available spots', async () => {
    const event = await Event.create({
      name: 'Available Spots Event',
      description: 'Testing available spots',
      eventDate: new Date('2025-12-31'),
      location: 'Test Location',
      maxCapacity: 50,
      userId: testUser.id.toString(),
    })

    const availableSpots = await event.getRealAvailableSpots()
    expect(availableSpots).toBe(50)
  })

  it('should return 0 available spots when event is inactive', async () => {
    const event = await Event.create({
      name: 'Inactive Event',
      description: 'Testing inactive event',
      eventDate: new Date('2025-12-31'),
      location: 'Test Location',
      maxCapacity: 50,
      active: false,
      userId: testUser.id.toString(),
    })

    const availableSpots = await event.getRealAvailableSpots()
    expect(availableSpots).toBe(0)
  })
})
