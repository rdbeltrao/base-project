import type { QueryInterface } from 'sequelize'
import bcrypt from 'bcryptjs'

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Clean up existing data to make the seed idempotent
  await queryInterface.bulkDelete('user_roles', {}, {})
  await queryInterface.bulkDelete('users', {}, {})
  await queryInterface.bulkDelete('role_permissions', {}, {})
  await queryInterface.bulkDelete('roles', {}, {})
  await queryInterface.bulkDelete('permissions', {}, {})

  await queryInterface.bulkInsert('permissions', [
    {
      id: 1001,
      resource: 'user',
      action: 'manage',
      description: 'Gerenciar usuários',
      active: true,
    },
    {
      id: 1002,
      resource: 'user',
      action: 'delete',
      description: 'Deletar usuários',
      active: true,
    },
    {
      id: 1003,
      resource: 'role',
      action: 'manage',
      description: 'Gerenciar papéis',
      active: true,
    },
    {
      id: 1004,
      resource: 'role',
      action: 'delete',
      description: 'Deletar papéis',
      active: true,
    },
  ])

  await queryInterface.bulkInsert('roles', [
    {
      id: 1001,
      name: 'admin',
      description: 'Administrador do sistema',
      active: true,
    },
    {
      id: 1002,
      name: 'user',
      description: 'Usuário padrão',
      active: true,
    },
  ])

  await queryInterface.bulkInsert('role_permissions', [
    {
      role_id: 1001,
      permission_id: 1001,
    },
    {
      role_id: 1001,
      permission_id: 1002,
    },
    {
      role_id: 1001,
      permission_id: 1003,
    },
    {
      role_id: 1001,
      permission_id: 1004,
    },
  ])

  await queryInterface.bulkInsert('users', [
    {
      id: 1001,
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      active: true,
    },
    {
      id: 1002,
      name: 'Regular User',
      email: 'user@example.com',
      password: bcrypt.hashSync('user123', 10),
      active: true,
    },
  ])

  await queryInterface.bulkInsert('user_roles', [
    {
      user_id: 1001,
      role_id: 1001,
    },
    {
      user_id: 1001,
      role_id: 1002,
    },
    {
      user_id: 1002,
      role_id: 1002,
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
