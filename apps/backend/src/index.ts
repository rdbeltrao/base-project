import app, { initDatabase } from './app'

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    const dbConnected = await initDatabase()
    if (!dbConnected) {
      console.error('Failed to connect to the database')
      process.exit(1)
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Iniciar o servidor apenas se não estiver sendo importado (ex: Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer()
}
