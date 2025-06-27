import type { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

  // Obter o ID do usuário admin existente
  const [adminUsers] = (await queryInterface.sequelize.query(
    `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1`
  )) as [Array<{ id: string }>, unknown]

  const adminUserId = adminUsers[0]?.id

  if (!adminUserId) {
    console.log('Admin user not found. Skipping events and reservations seed.')
    return
  }

  // Criar permissões para eventos e reservas
  await queryInterface.bulkInsert('permissions', [
    {
      id: 5,
      resource: 'event',
      action: 'create',
      description: 'Criar eventos',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 6,
      resource: 'event',
      action: 'update',
      description: 'Atualizar eventos',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 7,
      resource: 'event',
      action: 'delete',
      description: 'Excluir eventos',
      active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 8,
      resource: 'reservation',
      action: 'manage',
      description: 'Gerenciar reservas',
      active: true,
      created_at: now,
      updated_at: now,
    },
  ])

  // Adicionar permissões ao papel de administrador
  await queryInterface.bulkInsert('role_permissions', [
    {
      role_id: 1, // ID do papel de admin
      permission_id: 5,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 1,
      permission_id: 6,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 1,
      permission_id: 7,
      created_at: now,
      updated_at: now,
    },
    {
      role_id: 1,
      permission_id: 8,
      created_at: now,
      updated_at: now,
    },
  ])

  // Criar alguns eventos de exemplo
  const eventId1 = 1
  const eventId2 = 2
  const eventId3 = 3

  await queryInterface.bulkInsert('events', [
    {
      id: eventId1,
      name: 'Workshop de JavaScript',
      description: 'Um workshop intensivo sobre JavaScript moderno e suas aplicações',
      event_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de agora
      location: 'Sala de Conferências A',
      online_link: null,
      max_capacity: 30,
      available_spots: 30,
      locked_spots: 0,
      active: true,
      user_id: adminUserId,
      created_at: now,
      updated_at: now,
    },
    {
      id: eventId2,
      name: 'Webinar sobre React',
      description: 'Webinar online sobre React e suas novidades',
      event_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dias a partir de agora
      location: null,
      online_link: 'https://meet.example.com/react-webinar',
      max_capacity: 100,
      available_spots: 100,
      locked_spots: 0,
      active: true,
      user_id: adminUserId,
      created_at: now,
      updated_at: now,
    },
    {
      id: eventId3,
      name: 'Hackathon de Inovação',
      description: 'Um evento de 48 horas para desenvolver soluções inovadoras',
      event_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de agora
      location: 'Centro de Convenções',
      online_link: null,
      max_capacity: 50,
      available_spots: 50,
      locked_spots: 0,
      active: true,
      user_id: adminUserId,
      created_at: now,
      updated_at: now,
    },
  ])

  // Obter o ID de um usuário regular (se existir)
  const [regularUsers] = (await queryInterface.sequelize.query(
    `SELECT id FROM users WHERE email != 'admin@example.com' LIMIT 1`
  )) as [Array<{ id: string }>, unknown]

  // Se houver um usuário regular, criar algumas reservas
  if (regularUsers.length > 0) {
    const regularUserId = regularUsers[0].id

    await queryInterface.bulkInsert('reservations', [
      {
        id: '660e8400-e29b-41d4-a716-446655440000',
        event_id: eventId1,
        user_id: regularUserId,
        reservation_date: now,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        event_id: eventId2,
        user_id: regularUserId,
        reservation_date: now,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      },
    ])

    // Atualizar os spots disponíveis para os eventos que têm reservas
    await queryInterface.sequelize.query(
      `UPDATE events SET available_spots = available_spots - 1 WHERE id IN ('${eventId1}', '${eventId2}')`
    )
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remover dados na ordem inversa para evitar problemas de chave estrangeira
  await queryInterface.bulkDelete('reservations', {}, {})
  await queryInterface.bulkDelete('events', {}, {})

  // Remover permissões adicionadas
  await queryInterface.bulkDelete('role_permissions', { permission_id: [5, 6, 7, 8] }, {})
  await queryInterface.bulkDelete('permissions', { id: [5, 6, 7, 8] }, {})
}
