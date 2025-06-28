import { Model, DataTypes, Optional, BelongsToGetAssociationMixin } from 'sequelize'
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

  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare getUser: BelongsToGetAssociationMixin<User>
  declare getEvent: BelongsToGetAssociationMixin<Event>
}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
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
  }
)

export default Reservation
