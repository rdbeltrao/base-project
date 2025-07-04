import type { QueryInterface, DataTypes } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
): Promise<void> {
  await queryInterface.createTable(
    'permissions',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      resource: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      uniqueKeys: {
        permission_resource_action_unique: {
          fields: ['resource', 'action'],
        },
      },
    }
  )
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('permissions')
}
