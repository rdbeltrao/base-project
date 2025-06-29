import { QueryInterface, DataTypes } from 'sequelize'

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('users', 'google_id', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    })

    await queryInterface.addColumn('users', 'google_access_token', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn('users', 'google_refresh_token', {
      type: DataTypes.TEXT,
      allowNull: true,
    })

    await queryInterface.addColumn('users', 'google_token_expiry', {
      type: DataTypes.DATE,
      allowNull: true,
    })

    await queryInterface.addColumn('reservations', 'google_calendar_event_id', {
      type: DataTypes.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('users', 'google_token_expiry')
    await queryInterface.removeColumn('users', 'google_refresh_token')
    await queryInterface.removeColumn('users', 'google_access_token')
    await queryInterface.removeColumn('users', 'google_id')
    await queryInterface.removeColumn('reservations', 'google_calendar_event_id')
  },
}
