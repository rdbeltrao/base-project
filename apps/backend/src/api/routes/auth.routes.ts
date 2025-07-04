import express from 'express'
import { body, validationResult } from 'express-validator'
import passport from '../../config/passport'
import { AuthController } from '../controllers/auth.controller'

const router: express.Router = express.Router()
const authController = new AuthController()

// Validation middleware
const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Login route
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
      async (err: any, user: any, info: any) => {
        if (err) {
          return next(err)
        }

        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid credentials' })
        }

        req.user = user
        authController.login(req, res, next)
      }
    )(req, res, next)
  }
)

// Register route
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
  authController.register.bind(authController)
)

// Verify token route
router.post(
  '/verify',
  [body('token').notEmpty().withMessage('Token is required'), validate],
  authController.verify.bind(authController)
)

// Profile routes
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  authController.getProfile.bind(authController)
)

router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  authController.updateProfile.bind(authController)
)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { session: false }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback.bind(authController)
)

router.get(
  '/google/status',
  passport.authenticate('jwt', { session: false }),
  authController.getGoogleStatus.bind(authController)
)

router.get('/google/config', authController.getGoogleConfig.bind(authController))

// Auth check route
router.get('/check-auth', authController.checkAuth.bind(authController))

// Logout route
router.post('/logout', authController.logout.bind(authController))

export default router