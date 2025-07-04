import 'pg'
import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from './config/passport'
import { corsConfig } from './config/cors'
import cookieParser from 'cookie-parser';
// authMiddleware is no longer imported here for global use.
// protectApi from './middleware/authMiddleware' will be imported in route files.

// Import new organized routes
import { authRoutes, usersRoutes } from './api/routes'
import rolesRoutes from './routes/roles.routes'
import eventsRoutes from './routes/events.routes'
import reservationsRoutes from './routes/reservations.routes'
import statsRoutes from './routes/stats.routes'

const app: express.Application = express()

// Security and logging middleware
app.use(corsConfig)
app.use(helmet())
app.use(morgan('dev'))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// The global authMiddleware has been removed.
// Specific API routes will be protected using the 'protectApi' middleware where needed.

// Authentication middleware
app.use(passport.initialize())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/stats', statsRoutes)

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Ping' })
})

// Global error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

export default app
