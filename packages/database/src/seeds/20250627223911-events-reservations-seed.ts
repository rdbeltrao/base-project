import type { QueryInterface } from 'sequelize'

const getImageUrl = async () => {
  const imageUrl = await fetch('https://picsum.photos/800/500')
  return imageUrl.url
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

  const [adminUsers] = (await queryInterface.sequelize.query(
    `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1`
  )) as [Array<{ id: string }>, unknown]

  const adminUserId = adminUsers[0]?.id

  if (!adminUserId) {
    console.log('Admin user not found. Skipping events and reservations seed.')
    return
  }

  await queryInterface.bulkInsert('permissions', [
    {
      id: 1005,
      resource: 'event',
      action: 'manage',
      description: 'Gerenciar eventos',
      active: true,
    },
    {
      id: 1006,
      resource: 'event',
      action: 'delete',
      description: 'Excluir eventos',
      active: true,
    },
    {
      id: 1007,
      resource: 'reservation',
      action: 'manage',
      description: 'Gerenciar reservas',
      active: true,
    },
    {
      id: 1008,
      resource: 'reservation',
      action: 'delete',
      description: 'Excluir reservas',
      active: true,
    },
    {
      id: 1009,
      resource: 'reservation',
      action: 'confirm',
      description: 'Confirmar reservas',
      active: true,
    },
  ])

  await queryInterface.bulkInsert('role_permissions', [
    {
      role_id: 1001,
      permission_id: 1005,
    },
    {
      role_id: 1001,
      permission_id: 1006,
    },
    {
      role_id: 1001,
      permission_id: 1007,
    },
    {
      role_id: 1001,
      permission_id: 1008,
    },
    {
      role_id: 1001,
      permission_id: 1009,
    },
  ])

  await queryInterface.bulkInsert('events', [
    {
      id: 1001,
      name: 'Workshop de JavaScript',
      description: 'Um workshop intensivo sobre JavaScript moderno e suas aplicações',
      event_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de agora
      location: 'Sala de Conferências A',
      online_link: null,
      max_capacity: 30,
      active: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1002,
      name: 'Webinar sobre React',
      description: 'Webinar online sobre React e suas novidades',
      event_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dias a partir de agora
      location: null,
      online_link: 'https://meet.example.com/react-webinar',
      max_capacity: 100,
      active: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1003,
      name: 'Hackathon de Inovação',
      description: 'Um evento de 48 horas para desenvolver soluções inovadoras',
      event_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de agora
      location: 'Centro de Convenções',
      online_link: null,
      max_capacity: 50,
      active: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
  ])

  const [regularUsers] = (await queryInterface.sequelize.query(
    `SELECT id FROM users WHERE email != 'admin@example.com' LIMIT 1`
  )) as [Array<{ id: string }>, unknown]
  if (regularUsers.length > 0) {
    const regularUserId = regularUsers[0].id

    await queryInterface.bulkInsert('reservations', [
      {
        event_id: 1001,
        user_id: regularUserId,
        reservation_date: now,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      },
      {
        event_id: 1002,
        user_id: regularUserId,
        reservation_date: now,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      },
    ])
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('reservations', {}, {})
  await queryInterface.bulkDelete('events', {}, {})

  await queryInterface.bulkDelete('role_permissions', { permission_id: [5, 6, 7, 8] }, {})
  await queryInterface.bulkDelete('permissions', { id: [5, 6, 7, 8] }, {})
}
