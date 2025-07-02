import express from 'express'
import { body, validationResult } from 'express-validator'
import { User, Role } from '@test-pod/database'
import jwt, { SignOptions } from 'jsonwebtoken'
import passport from '../config/passport'
import type { SessionUser } from '@test-pod/database'
import { getUserForSession } from '../utils/user'

const router: express.Router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'

const setCookieHeader = (res: express.Response, token: string) => {
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const isProduction = process.env.NODE_ENV === 'production'

  let cookieOptions = `${cookieName}=${token}; Path=/; SameSite=Lax; HttpOnly=true`

  if (isProduction) {
    cookieOptions += '; Secure'
  }

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions += `; Domain=${cookieDomain}`
  }

  res.setHeader('Set-Cookie', cookieOptions)
}

const clearCookieHeader = (res: express.Response) => {
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const isProduction = process.env.NODE_ENV === 'production'

  let cookieOptions = `${cookieName}=; Path=/; SameSite=Lax; HttpOnly=true; Expires=Thu, 01 Jan 1970 00:00:00 GMT`

  if (isProduction) {
    cookieOptions += '; Secure'
  }

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieOptions += `; Domain=${cookieDomain}`
  }

  res.setHeader('Set-Cookie', cookieOptions)
}

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    passport.authenticate(
      'local',
      { session: false },
      async (err: any, user: SessionUser, info: any) => {
        if (err) {
          return next(err)
        }

        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid credentials' })
        }

        try {
          const token = jwt.sign(user, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
          } as SignOptions)

          setCookieHeader(res, token)
          res.json({ user, token })
        } catch (error) {
          console.error('Error during login:', error)
          res.status(500).json({ message: 'Error during login' })
        }
      }
    )(req, res, next)
  }
)

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    validate,
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const existingUser = await User.findOne({ where: { email: req.body.email } })

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' })
      }

      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        active: true,
      })

      const defaultRole = await Role.findOne({ where: { name: 'user' } })
      await user.addRole(defaultRole?.id)

      const sessionUser = await getUserForSession(user.id)

      if (!sessionUser) {
        return res.status(500).json({ message: 'Error creating session user' })
      }

      const token = jwt.sign(sessionUser, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions)

      setCookieHeader(res, token)
      res.status(201).json({ user: sessionUser, token })
    } catch (_error) {
      res.status(500).json({ message: 'Error during registration' })
    }
  }
)

router.post(
  '/verify',
  [body('token').notEmpty().withMessage('Token is required'), validate],
  async (req: express.Request, res: express.Response) => {
    try {
      const decoded = jwt.verify(req.body.token, JWT_SECRET) as {
        id: number
        email: string
      }

      const sessionUser = await getUserForSession(decoded.id)

      if (!sessionUser || !sessionUser.active) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      res.json({ user: sessionUser })
    } catch (_error) {
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
)

router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user as SessionUser

      res.json({ user })
    } catch (_error) {
      console.error('Error fetching profile:', _error)
      res.status(500).json({ message: 'Error fetching profile' })
    }
  }
)

router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.user as SessionUser
      const { name } = req.body

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ message: 'Nome deve ter pelo menos 2 caracteres' })
      }

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      user.name = name.trim()
      await user.save()

      const updatedUser = await getUserForSession(user.id)

      if (!updatedUser) {
        return res.status(500).json({ message: 'Erro ao recuperar dados do usuário' })
      }

      const sessionUser = await getUserForSession(user.id)

      if (!sessionUser) {
        return res.status(500).json({ message: 'Error creating session user' })
      }

      const token = jwt.sign(sessionUser, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions)

      setCookieHeader(res, token)
      res.json({ user: updatedUser, token })
    } catch (error) {
      console.error('Error updating profile:', error)
      res.status(500).json({ message: 'Erro ao atualizar perfil' })
    }
  }
)

router.get('/google', passport.authenticate('google', { session: false }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user as SessionUser

      const sessionUser = await getUserForSession(user.id)

      if (!sessionUser) {
        return res.status(500).json({ message: 'Error creating session user' })
      }

      const token = jwt.sign(sessionUser, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions)

      setCookieHeader(res, token)

      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
      const callbackUrl = `${authUrl}/auth/google/callback`
      res.redirect(callbackUrl)
    } catch (error) {
      console.error('Error during Google authentication:', error)
      res.status(500).json({ message: 'Error during Google authentication' })
    }
  }
)

router.get(
  '/google/status',
  passport.authenticate('jwt', { session: false }),
  async (req: express.Request, res: express.Response) => {
    try {
      const user = req.user as SessionUser
      const googleUser = await User.findByPk(user.id)
      if (!googleUser || !googleUser.googleId) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.json({
        isConnected: !!googleUser.googleId,
        hasValidToken: !!googleUser.googleAccessToken,
      })
    } catch (error) {
      console.error('Error checking Google connection status:', error)
      res.status(500).json({ message: 'Error checking Google connection status' })
    }
  }
)

router.get('/google/config', (req: express.Request, res: express.Response) => {
  const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  res.json({ enabled: isGoogleConfigured })
})

const extractTokenFromCookies = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return null
  }

  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === cookieName) {
      return value
    }
  }

  return null
}

router.get('/check-auth', async (req: express.Request, res: express.Response) => {
  try {
    let token: string | null = null

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      token = extractTokenFromCookies(req.headers.cookie as string)
    }
    if (!token && req.cookies) {
      token = req.cookies[process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken']
    }

    if (!token) {
      return res.status(401).json({ authenticated: false })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number
        email: string
      }

      const sessionUser = await getUserForSession(decoded.id)

      if (!sessionUser || !sessionUser.active) {
        return res.status(401).json({ authenticated: false })
      }

      res.json({ authenticated: true, user: sessionUser })
    } catch (_error) {
      return res.status(401).json({ authenticated: false })
    }
  } catch (error) {
    console.error('Error checking authentication:', error)
    res.status(500).json({ message: 'Error checking authentication' })
  }
})

router.post('/logout', (req: express.Request, res: express.Response) => {
  try {
    clearCookieHeader(res)
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({ message: 'Error during logout' })
  }
})

export default router
