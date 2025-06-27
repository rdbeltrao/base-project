import { Model, DataTypes, Optional, BelongsToGetAssociationMixin } from 'sequelize'
import sequelize from '../db'
import User from './User'

export interface EventAttributes {
  id: string
  name: string
  description?: string
  eventDate: Date
  location?: string
  onlineLink?: string
  maxCapacity: number
  availableSpots: number
  lockedSpots: number
  active: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type EventCreationAttributes = Optional<
  EventAttributes,
  'id' | 'availableSpots' | 'lockedSpots' | 'active' | 'createdAt' | 'updatedAt'
>

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  declare id: string
  declare name: string
  declare description: string | undefined
  declare eventDate: Date
  declare location: string | undefined
  declare onlineLink: string | undefined
  declare maxCapacity: number
  declare availableSpots: number
  declare lockedSpots: number
  declare active: boolean
  declare userId: string

  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  // Associations
  declare getUser: BelongsToGetAssociationMixin<User>

  // Methods
  async getRealAvailableSpots(): Promise<number> {
    // Se o evento estiver inativo, não há vagas disponíveis
    if (!this.active) {
      return 0
    }

    const confirmedReservations = await sequelize.models.Reservation.count({
      where: {
        eventId: this.id,
        status: 'confirmed',
      },
    })

    // Vagas disponíveis = capacidade máxima - reservas confirmadas - vagas travadas
    return Math.max(0, this.maxCapacity - confirmedReservations - this.lockedSpots)
  }

  async lockSpot(t?: any): Promise<boolean> {
    const transaction = t || (await sequelize.transaction())
    const ownTransaction = !t

    try {
      // Verificar se o evento está ativo
      if (!this.active) {
        if (ownTransaction) await transaction.rollback()
        return false
      }

      // Verificar se há vagas disponíveis
      const realAvailableSpots = await this.getRealAvailableSpots()

      if (realAvailableSpots <= 0) {
        if (ownTransaction) await transaction.rollback()
        return false
      }

      // Travar uma vaga
      await this.update(
        {
          lockedSpots: this.lockedSpots + 1,
        },
        { transaction }
      )

      if (ownTransaction) await transaction.commit()
      return true
    } catch (err) {
      if (ownTransaction) await transaction.rollback()
      throw err
    }
  }

  async unlockSpot(t?: any): Promise<boolean> {
    const transaction = t || (await sequelize.transaction())
    const ownTransaction = !t

    try {
      if (this.lockedSpots > 0) {
        await this.update(
          {
            lockedSpots: this.lockedSpots - 1,
          },
          { transaction }
        )
      }

      if (ownTransaction) await transaction.commit()
      return true
    } catch (err) {
      if (ownTransaction) await transaction.rollback()
      throw err
    }
  }
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      type: DataTypes.DATE,
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
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    availableSpots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: function () {
        // @ts-expect-error - this refers to the model instance
        return this.maxCapacity
      },
      validate: {
        min: 0,
        maxAvailableSpots(value: number) {
          // @ts-expect-error - this refers to the model instance
          if (value > this.maxCapacity) {
            throw new Error('Available spots cannot exceed maximum capacity')
          }
        },
      },
    },
    lockedSpots: {
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
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
  }
)

export default Event
