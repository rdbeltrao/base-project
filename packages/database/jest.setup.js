// jest.setup.ts
import { sequelize } from './src/db'

beforeAll(async () => {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })
})

beforeEach(async () => {
  const models = sequelize.models
  for (const modelName in models) {
    await models[modelName].destroy({ where: {}, truncate: true, force: true })
  }
})

afterAll(async () => {
  await sequelize.close()
})
