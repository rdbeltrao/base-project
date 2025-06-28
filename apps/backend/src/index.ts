import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { sequelize } from '@test-pod/database'
import passport from './config/passport'

import authRoutes from './routes/auth.routes'
import usersRoutes from './routes/users.routes'
import rolesRoutes from './routes/roles.routes'
import eventsRoutes from './routes/events.routes'
import reservationsRoutes from './routes/reservations.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/reservations', reservationsRoutes)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Ping' })
})

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

startServer()
