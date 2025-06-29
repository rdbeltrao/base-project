import sequelize from './src/db'

beforeAll(async () => {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })
})

beforeEach(async () => {
  await sequelize.query(
    'TRUNCATE TABLE "reservations", "events", "user_roles", "role_permissions", "users", "roles", "permissions" RESTART IDENTITY CASCADE;'
  )
})

// Fechar a conexão depois de todos os testes
afterAll(async () => {
  await sequelize.close()
})
