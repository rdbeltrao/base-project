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
      featured: true,
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
      featured: true,
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
      featured: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1004,
      name: 'Curso Avançado de Node.js',
      description: 'Aprenda padrões de projeto e performance em aplicações Node.js',
      event_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 dias a partir de agora
      location: 'Laboratório 3',
      online_link: null,
      max_capacity: 40,
      active: true,
      featured: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1005,
      name: 'Bootcamp de DevOps',
      description: 'Imersão prática em CI/CD, containers e infraestrutura como código',
      event_date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 dias
      location: 'Auditório Principal',
      online_link: null,
      max_capacity: 60,
      active: true,
      featured: true,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1006,
      name: 'Live Coding: APIs REST com Fastify',
      description: 'Sessão online construindo uma API do zero com Fastify e TypeScript',
      event_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 dias
      location: null,
      online_link: 'https://meet.example.com/fastify-live',
      max_capacity: 150,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1007,
      name: 'Encontro de Comunidades Tech',
      description: 'Networking e lightning talks com várias comunidades de tecnologia',
      event_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      location: 'Espaço Coworking X',
      online_link: null,
      max_capacity: 80,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1008,
      name: 'Workshop de UI/UX Design',
      description: 'Princípios de design centrado no usuário aplicados a produtos digitais',
      event_date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 dias
      location: 'Sala de Design 2',
      online_link: null,
      max_capacity: 25,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1009,
      name: 'Webinar: Introdução ao Kubernetes',
      description: 'Conceitos básicos de orquestração de containers com demonstrações ao vivo',
      event_date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 dias
      location: null,
      online_link: 'https://meet.example.com/k8s-intro',
      max_capacity: 120,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1010,
      name: 'Palestra: Carreira em Ciência de Dados',
      description: 'Tendências do mercado e habilidades essenciais para cientistas de dados',
      event_date: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000), // 32 dias
      location: 'Sala de Conferências B',
      online_link: null,
      max_capacity: 70,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1011,
      name: 'Oficina de Testes Automatizados',
      description: 'Estratégias de testes unitários, integração e end‑to‑end com Jest e Cypress',
      event_date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 dias
      location: 'Laboratório 2',
      online_link: null,
      max_capacity: 35,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1012,
      name: 'Coding Dojo de Algoritmos',
      description: 'Sessão prática resolvendo problemas de algoritmos em pares',
      event_date: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 dias
      location: 'Sala Hacker',
      online_link: null,
      max_capacity: 20,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1013,
      name: 'Conference Day: Serverless Architecture',
      description: 'Palestras e cases sobre arquiteturas serverless em produção',
      event_date: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // 75 dias
      location: 'Centro de Convenções 2',
      online_link: null,
      max_capacity: 120,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1014,
      name: 'Webinar: Segurança em APIs GraphQL',
      description: 'Boas práticas para proteger APIs GraphQL em produção',
      event_date: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000), // 27 dias
      location: null,
      online_link: 'https://meet.example.com/graphql-security',
      max_capacity: 110,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1015,
      name: 'Hackerspace Open Day',
      description: 'Dia de portas abertas para experimentar impressoras 3D e IoT',
      event_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      location: 'Hackerspace Local',
      online_link: null,
      max_capacity: 45,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1016,
      name: 'Seminário sobre Inteligência Artificial Ética',
      description: 'Debate sobre implicações éticas do uso de IA em larga escala',
      event_date: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000), // 50 dias
      location: 'Auditório Smart',
      online_link: null,
      max_capacity: 90,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1017,
      name: 'Curso Intensivo de Docker',
      description: 'Aprenda a criar, publicar e orquestrar containers em 2 dias',
      event_date: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000), // 22 dias
      location: 'Sala Cloud 1',
      online_link: null,
      max_capacity: 30,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1018,
      name: 'Mesa Redonda: Futuro do Front‑End',
      description: 'Discussão aberta sobre novas ferramentas e tendências do front‑end',
      event_date: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000), // 37 dias
      location: 'Sala Debate',
      online_link: null,
      max_capacity: 55,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1019,
      name: 'Live Coding: Apps Móveis com Flutter',
      description: 'Construindo um app completo em Flutter, passo a passo',
      event_date: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000), // 13 dias
      location: null,
      online_link: 'https://meet.example.com/flutter-live',
      max_capacity: 140,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1020,
      name: 'Oficina de Clean Architecture',
      description: 'Aplicando Clean Architecture em projetos Node e React',
      event_date: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000), // 65 dias
      location: 'Sala Arquitetura',
      online_link: null,
      max_capacity: 40,
      active: true,
      featured: false,
      user_id: adminUserId,
      image_url: await getImageUrl(),
    },
    {
      id: 1021,
      name: 'Workshop de Microserviços com NestJS',
      description: 'Construção de microserviços escaláveis usando NestJS e RabbitMQ',
      event_date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 dias
      location: 'Laboratório Backend',
      online_link: null,
      max_capacity: 35,
      active: true,
      featured: false,
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
