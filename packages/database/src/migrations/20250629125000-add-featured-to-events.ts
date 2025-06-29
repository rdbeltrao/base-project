import { QueryInterface, DataTypes } from 'sequelize'

export default {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('events', 'featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    })
  },

  down: async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
    await queryInterface.removeColumn('events', 'featured')
  },
}
