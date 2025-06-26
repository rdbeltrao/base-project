import bcrypt from 'bcryptjs'
import User from '../../models/User'
import sequelize from '../../db'

describe('User', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  it('should create a user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
    }

    const user = await User.create(userData)

    expect(user).toBeDefined()
    expect(user.id).toBeDefined()
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
    expect(user.active).toBe(true)
    expect(user.createdAt).toBeDefined()
    expect(user.updatedAt).toBeDefined()
  })

  it('should encrypt password before saving', async () => {
    const userData = {
      name: 'Password Test',
      email: 'password@example.com',
      password: '123',
    }

    const user = await User.create(userData)

    expect(user.password).not.toBe(userData.password)

    const isPasswordValid = bcrypt.compareSync(userData.password, user.password)
    expect(isPasswordValid).toBe(true)
  })

  it('should reject an invalid email', async () => {
    const userData = {
      name: 'Invalid Email',
      email: 'invalid-email',
      password: '123',
    }

    await expect(User.create(userData)).rejects.toThrow()
  })

  it('should find active users using scope', async () => {
    await User.create({
      name: 'Active User',
      email: 'active@example.com',
      password: '123',
      active: true,
    })

    await User.create({
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: '123',
      active: false,
    })

    const activeUsers = await User.scope('actives').findAll()

    expect(activeUsers.length).toBeGreaterThanOrEqual(1)
    expect(activeUsers.every(user => user.active === true)).toBe(true)
  })
})
