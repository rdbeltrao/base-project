export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('UserRole', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  // Add a unique constraint to prevent duplicate user-role assignments
  await queryInterface.addConstraint('UserRole', {
    fields: ['user_id', 'role_id'],
    type: 'unique',
    name: 'unique_user_role'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('UserRole');
}
