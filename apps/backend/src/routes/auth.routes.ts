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
          const token = jwt.sign(user, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: JWT_EXPIRES_IN,
          } as SignOptions)

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

      const defaultRole = await Role.findOne({ where: { name: 'User' } })

      if (defaultRole) {
        await user.addRole(defaultRole)
      }

      const sessionUser = await getUserForSession(user.id)

      if (!sessionUser) {
        return res.status(500).json({ message: 'Error creating session user' })
      }

      const token = jwt.sign(sessionUser, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions)

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
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET || 'your-secret-key') as {
        id: number
        email: string
      }

      const sessionUser = await getUserForSession(decoded.id)

      if (!sessionUser || !sessionUser.active) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      res.json({ user: sessionUser })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
    } catch (error) {
      console.error('Error fetching profile:', error)
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

      const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as jwt.SignOptions)

      res.json({ user: updatedUser, token })
    } catch (error) {
      console.error('Error updating profile:', error)
      res.status(500).json({ message: 'Erro ao atualizar perfil' })
    }
  }
)

export default router
