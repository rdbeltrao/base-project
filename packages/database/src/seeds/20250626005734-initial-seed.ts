import type { QueryInterface } from 'sequelize'
import bcrypt from 'bcryptjs'

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

  await queryInterface.bulkInsert('permissions', [
    {
      resource: 'user',
      action: 'edit',
      description: 'Editar usuários',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      resource: 'user',
      action: 'view',
      description: 'Visualizar usuários',
      active: true,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('roles', [
    {
      name: 'admin',
      description: 'Administrador do sistema',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      name: 'user',
      description: 'Usuário padrão',
      active: true,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('role_permissions', [
    {
      role_id: 1,
      permission_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 1,
      permission_id: 2,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 2,
      permission_id: 2,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('users', [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      active: true,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('user_roles', [
    {
      user_id: 1,
      role_id: 1,
      created_at: now,
      updated_at: now,
    },
  ])
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('user_roles', {}, {})
  await queryInterface.bulkDelete('users', {}, {})
  await queryInterface.bulkDelete('role_permissions', {}, {})
  await queryInterface.bulkDelete('roles', {}, {})
  await queryInterface.bulkDelete('permissions', {}, {})
}
