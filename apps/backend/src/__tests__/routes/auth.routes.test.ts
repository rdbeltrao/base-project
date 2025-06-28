import request from 'supertest'
import express from 'express'
import authRoutes from '../../routes/auth.routes'
import { User, Role } from '@test-pod/database'
import { getUserForSession } from '../../utils/user'
import jwt from 'jsonwebtoken'
import passport from '../../config/passport'

jest.mock('@test-pod/database', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    addRole: jest.fn(),
  }

  const mockRole = {
    findOne: jest.fn(),
  }

  return {
    User: mockUser,
    Role: mockRole,
  }
})

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockImplementation(token => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token')
    }
    return { id: 1, email: 'test@example.com' }
  }),
}))

jest.mock('../../config/passport', () => ({
  authenticate: jest.fn().mockImplementation((strategy, options, callback) => {
    return (req: express.Request, _res: express.Response, _next: express.NextFunction) => {
      if (req.body.email === 'error@example.com') {
        return callback(new Error('Authentication error'), null, null)
      }

      if (req.body.email === 'invalid@example.com') {
        return callback(null, null, { message: 'Invalid credentials' })
      }

      const user = {
        id: 1,
        email: req.body.email || 'test@example.com',
        name: 'Test User',
        active: true,
        roles: [{ name: 'User' }],
      }

      callback(null, user, null)
    }
  }),
  __esModule: true,
  default: {
    authenticate: jest.fn().mockImplementation((_strategy, _options) => {
      return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.headers.authorization === 'Bearer invalid-token') {
          return res.status(401).json({ message: 'Unauthorized' })
        }

        req.user = {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          active: true,
          roles: [{ name: 'User' }],
        }

        next()
      }
    }),
  },
}))

jest.mock('../../utils/user', () => ({
  getUserForSession: jest.fn().mockImplementation(id => {
    if (id === -1) return null

    return {
      id: id || 1,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      roles: [{ name: 'User' }],
    }
  }),
}))

const app = express()
app.use(express.json())

passport.authenticate = jest.fn().mockImplementation((strategy, options, callback) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (strategy === 'local') {
      if (req.body.email === 'error@example.com') {
        return callback(new Error('Authentication error'), null, null)(req, res, next)
      }

      if (req.body.email === 'invalid@example.com') {
        return callback(null, null, { message: 'Invalid credentials' })(req, res, next)
      }

      const user = {
        id: 1,
        email: req.body.email || 'test@example.com',
        name: 'Test User',
        active: true,
        roles: [{ name: 'User' }],
      }

      return callback(null, user, null)(req, res, next)
    } else if (strategy === 'jwt') {
      if (req.headers.authorization === 'Bearer invalid-token') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      req.user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true,
        roles: [{ name: 'User' }],
      }

      next()
    }
  }
})

app.use('/auth', authRoutes)

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.mocked(User.findOne).mockReset()
    jest.mocked(User.create).mockReset()
    jest.mocked(User.findByPk).mockReset()
    jest.mocked(Role.findOne).mockReset()
  })

  describe('POST /auth/login', () => {
    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/auth/login').send({ email: 'test@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 401 if credentials are invalid', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'invalid@example.com', password: 'password123' })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid credentials')
    })

    it('should return 500 if authentication throws an error', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'error@example.com', password: 'password123' })

      expect(response.status).toBe(500)
    })

    it('should return user and token on successful login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(200)
      expect(response.body.user).toBeDefined()
      expect(response.body.token).toBe('mocked-jwt-token')
      expect(jwt.sign).toHaveBeenCalled()
    })
  })

  describe('POST /auth/register', () => {
    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'invalid-email', password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'short' })

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 400 if email is already in use', async () => {
      jest.mocked(User.findOne).mockResolvedValue({ id: 1 } as any)

      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'existing@example.com', password: 'password123' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Email already in use')
    })

    it('should return 500 if role assignment fails', async () => {
      jest.mocked(User.findOne).mockResolvedValue(null)
      jest.mocked(User.create).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        addRole: jest.fn().mockRejectedValue(new Error('Role assignment failed')),
      } as any)
      jest.mocked(Role.findOne).mockResolvedValue({ id: 1, name: 'User' } as any)

      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(500)
    })

    it('should return 500 if getUserForSession fails', async () => {
      jest.mocked(User.findOne).mockResolvedValue(null)
      jest.mocked(User.create).mockResolvedValue({
        id: -1,
        name: 'Test User',
        email: 'test@example.com',
        addRole: jest.fn().mockResolvedValue(true),
      } as any)
      jest.mocked(Role.findOne).mockResolvedValue({ id: 1, name: 'User' } as any)

      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe('Error creating session user')
    })

    it('should return user and token on successful registration', async () => {
      jest.mocked(User.findOne).mockResolvedValue(null)
      jest.mocked(User.create).mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        addRole: jest.fn().mockResolvedValue(true),
      } as any)
      jest.mocked(Role.findOne).mockResolvedValue({ id: 1, name: 'User' } as any)

      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(201)
      expect(response.body.user).toBeDefined()
      expect(response.body.token).toBe('mocked-jwt-token')
      expect(jwt.sign).toHaveBeenCalled()
    })
  })

  describe('POST /auth/verify', () => {
    it('should return 400 if token is missing', async () => {
      const response = await request(app).post('/auth/verify').send({})

      expect(response.status).toBe(400)
      expect(response.body.errors).toBeDefined()
    })

    it('should return 401 if token is invalid', async () => {
      const response = await request(app).post('/auth/verify').send({ token: 'invalid-token' })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid token')
    })

    it('should return 401 if user is not found or inactive', async () => {
      ;(getUserForSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await request(app).post('/auth/verify').send({ token: 'valid-token' })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('Invalid token')
    })

    it('should return user data if token is valid', async () => {
      const response = await request(app).post('/auth/verify').send({ token: 'valid-token' })

      expect(response.status).toBe(200)
      expect(response.body.user).toBeDefined()
    })
  })

  describe('GET /auth/profile', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })

    it('should return user profile if authenticated', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.user).toBeDefined()
    })
  })

  describe('PUT /auth/profile', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(401)
    })

    it('should return 400 if name is invalid', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'A' })

      expect(response.status).toBe(400)
      expect(response.body.message).toBe('Nome deve ter pelo menos 2 caracteres')
    })

    it('should return 404 if user is not found', async () => {
      jest.mocked(User.findByPk).mockResolvedValue(null)

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(404)
      expect(response.body.message).toBe('Usuário não encontrado')
    })

    it('should return 500 if getUserForSession fails after update', async () => {
      jest.mocked(User.findByPk).mockResolvedValue({
        id: -1,
        name: 'Test User',
        save: jest.fn().mockResolvedValue(true),
      } as any)

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(500)
      expect(response.body.message).toBe('Erro ao recuperar dados do usuário')
    })

    it('should update user profile and return new token', async () => {
      jest.mocked(User.findByPk).mockResolvedValue({
        id: 1,
        name: 'Test User',
        save: jest.fn().mockResolvedValue(true),
      } as any)

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(200)
      expect(response.body.user).toBeDefined()
      expect(response.body.token).toBe('mocked-jwt-token')
      expect(jwt.sign).toHaveBeenCalled()
    })
  })
})
