import { Model, DataTypes, Optional, BelongsToGetAssociationMixin, NonAttribute } from 'sequelize'
import sequelize from '../db'
import User from './User'
import Event from './Event'

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
}

export interface ReservationAttributes {
  id: string
  eventId: string
  userId: string
  reservationDate: Date
  status: ReservationStatus
  googleCalendarEventId?: string
  createdAt: Date
  updatedAt: Date
}

export type ReservationCreationAttributes = Optional<
  ReservationAttributes,
  'id' | 'reservationDate' | 'status' | 'createdAt' | 'updatedAt'
>

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  declare id: string
  declare eventId: string
  declare userId: string
  declare reservationDate: Date
  declare status: ReservationStatus
  declare googleCalendarEventId?: string

  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare getUser: BelongsToGetAssociationMixin<User>
  declare getEvent: BelongsToGetAssociationMixin<Event>

  declare event?: NonAttribute<Event>
  declare user?: NonAttribute<User>

  static associate() {
    this.belongsTo(Event, { as: 'event', foreignKey: 'event_id' })
    this.belongsTo(User, { as: 'user', foreignKey: 'user_id' })
  }
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    reservationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReservationStatus)),
      allowNull: false,
      defaultValue: ReservationStatus.CONFIRMED,
    },
    googleCalendarEventId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    timestamps: true,
    indexes: [
      {
        name: 'reservations_event_id_user_id_unique',
        unique: true,
        fields: ['event_id', 'user_id'],
      },
    ],
    hooks: {
      beforeCreate: async (reservation: Reservation) => {
        // Buscar o evento associado à reserva
        const event = await Event.findByPk(reservation.eventId)

        if (!event) {
          throw new Error('Evento não encontrado')
        }

        // Verificar se o evento está ativo
        if (!event.active) {
          throw new Error('Não é possível reservar um evento inativo')
        }

        // Verificar se há vagas disponíveis
        const availableSpots = await event.getRealAvailableSpots()
        if (availableSpots <= 0) {
          throw new Error('Não há vagas disponíveis para este evento')
        }
      },
    },
  }
)

export default Reservation
