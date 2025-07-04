import { sequelize } from '@test-pod/database'

export const initDatabase = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    return true
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    return false
  }
}

export { sequelize }