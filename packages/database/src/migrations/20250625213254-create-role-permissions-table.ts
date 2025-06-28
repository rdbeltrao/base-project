import type { QueryInterface, DataTypes } from 'sequelize'

export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
): Promise<void> {
  await queryInterface.createTable('role_permissions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
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

  // Add a unique constraint to prevent duplicate role-permission assignments
  await queryInterface.addConstraint('role_permissions', {
    fields: ['role_id', 'permission_id'],
    type: 'unique',
    name: 'unique_role_permission',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('role_permissions')
}
