import { Sequelize } from 'sequelize';
import config from './config/config';  // ajuste o caminho se necessário

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

export default sequelize;