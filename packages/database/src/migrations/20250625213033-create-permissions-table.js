export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Permission', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
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
      allowNull: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  },
    {
      uniqueKeys: {
        permission_resource_action_unique: {
          fields: ['resource', 'action'],
        },
      },
    });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Permission');
}
