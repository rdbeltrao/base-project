import { Sequelize } from 'sequelize'
import config from './config'

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

const sequelize = new Sequelize(dbConfig)

export default sequelize
