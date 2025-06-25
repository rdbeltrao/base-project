export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('RolePermission', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Role',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Permission',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  // Add a unique constraint to prevent duplicate role-permission assignments
  await queryInterface.addConstraint('RolePermission', {
    fields: ['role_id', 'permission_id'],
    type: 'unique',
    name: 'unique_role_permission'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('RolePermission');
}
