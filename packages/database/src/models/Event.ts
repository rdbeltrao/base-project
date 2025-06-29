import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
  col,
} from 'sequelize'
import { ReservationStatus } from './Reservation'
import User from './User'
import Reservation from './Reservation'
import sequelize from '../db'

export interface EventAttributes {
  id: string
  name: string
  description?: string
  eventDate: Date
  location?: string
  onlineLink?: string
  imageUrl?: string
  maxCapacity: number
  reservedSpots: number
  active: boolean
  featured: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type EventCreationAttributes = Optional<
  EventAttributes,
  'id' | 'reservedSpots' | 'active' | 'featured' | 'createdAt' | 'updatedAt'
>

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  declare id: string
  declare name: string
  declare description: string | undefined
  declare eventDate: Date
  declare location: string | undefined
  declare onlineLink: string | undefined
  declare imageUrl: string | undefined
  declare maxCapacity: number
  declare reservedSpots: number
  declare active: boolean
  declare featured: boolean
  declare userId: string

  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare getUser: BelongsToGetAssociationMixin<User>
  declare getReservations: HasManyGetAssociationsMixin<Reservation>

  declare readonly user?: User
  declare readonly reservations?: Reservation[]

  static associate() {
    this.belongsTo(User, { as: 'user', foreignKey: 'user_id' })
    this.hasMany(Reservation, { as: 'reservations', foreignKey: 'event_id' })
  }

  async getRealAvailableSpots(): Promise<number> {
    if (!this.active) {
      return 0
    }

    const confirmedReservations = await this.getReservations({
      where: {
        status: ReservationStatus.CONFIRMED,
      },
    })

    return Math.max(0, this.maxCapacity - confirmedReservations.length)
  }
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    onlineLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    reservedSpots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    validate: {
      availableNotGreaterThanMax() {
        if (col('reserved_spots') > col('max_capacity')) {
          throw new Error('reserved_spots não pode ser maior que max_capacity')
        }
      },
      locationOrOnlineLink() {
        if (!this.location && !this.onlineLink) {
          throw new Error('Pelo menos um entre location e onlineLink deve ser fornecido')
        }
      },
    },
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
  }
)

export default Event
