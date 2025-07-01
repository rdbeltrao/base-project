import app, { initDatabase } from './app'
import type { VercelRequest, VercelResponse } from '@vercel/node'

let isDbInitialized = false

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Inicializa o banco de dados apenas uma vez
    if (!isDbInitialized) {
      const dbConnected = await initDatabase()
      if (!dbConnected) {
        console.error('Failed to connect to the database')
        return res.status(500).json({
          error: 'Database connection failed',
          message: 'Unable to connect to the database',
        })
      }
      isDbInitialized = true
    }

    return app(req, res)
  } catch (error) {
    console.error('Error in Vercel handler:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
    })
  }
}
