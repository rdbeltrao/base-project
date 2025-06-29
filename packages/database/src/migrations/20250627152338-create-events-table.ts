import { QueryInterface, DataTypes } from 'sequelize'

export default {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      online_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      max_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reserved_spots: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      ADD CONSTRAINT chk_available_le_max
      CHECK ("reserved_spots" <= "max_capacity");
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      ADD CONSTRAINT chk_location_or_online_link
      CHECK (
        "location" IS NOT NULL OR "online_link" IS NOT NULL
      );
    `)
  },

  down: async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      DROP CONSTRAINT IF EXISTS chk_available_le_max;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "events"
      DROP CONSTRAINT IF EXISTS chk_location_or_online_link;
    `)
    await queryInterface.dropTable('events')
  },
}
