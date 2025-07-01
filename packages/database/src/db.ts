import { Sequelize } from 'sequelize'
import pg from 'pg'
import config from './config'

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

const sequelize = new Sequelize({
  ...dbConfig,
  dialectModule: pg,
})

export default sequelize
