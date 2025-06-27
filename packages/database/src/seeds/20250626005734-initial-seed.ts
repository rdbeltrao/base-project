import type { QueryInterface } from 'sequelize'
import bcrypt from 'bcryptjs'

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

  await queryInterface.bulkInsert('permissions', [
    {
      id: 1,
      resource: 'user',
      action: 'manage',
      description: 'Gerenciar usuários',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      resource: 'user',
      action: 'delete',
      description: 'Deletar usuários',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      resource: 'role',
      action: 'manage',
      description: 'Gerenciar papéis',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      resource: 'role',
      action: 'delete',
      description: 'Deletar papéis',
      active: true,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('roles', [
    {
      id: 1,
      name: 'admin',
      description: 'Administrador do sistema',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
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
      role_id: 1,
      permission_id: 3,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 1,
      permission_id: 4,
      created_at: now,
      updated_at: now,
    },
  ])

  await queryInterface.bulkInsert('users', [
    {
      id: 1,
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
