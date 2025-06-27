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
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    timestamps: true,
    hooks: {
      // Antes de criar uma reserva, verificamos se há vagas disponíveis e travamos uma vaga
      beforeCreate: async (reservation: Reservation) => {
        const t = await sequelize.transaction()

        try {
          // Lock the event row to prevent concurrent updates
          const event = await Event.findByPk(reservation.eventId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          })

          if (!event) {
            await t.rollback()
            throw new Error('Event not found')
          }

          // Verificar se há vagas disponíveis e travar uma vaga
          const success = await event.lockSpot(t)

          if (!success) {
            await t.rollback()
            throw new Error('No available spots for this event')
          }

          await t.commit()
        } catch (err) {
          await t.rollback()
          throw err
        }
      },

      // Após criar uma reserva com sucesso, liberamos a vaga travada
      afterCreate: async (reservation: Reservation) => {
        const t = await sequelize.transaction()

        try {
          const event = await Event.findByPk(reservation.eventId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          })

          if (event) {
            // Liberar a vaga travada
            await event.unlockSpot(t)
          }

          await t.commit()
        } catch (err) {
          await t.rollback()
          throw err
        }
      },

      // Quando o status de uma reserva muda
      afterUpdate: async (reservation: Reservation) => {
        // Só prosseguir se o status mudou
        if (!reservation.changed('status')) return

        // Não precisamos fazer nada aqui, pois a contagem de reservas
        // confirmadas será usada para calcular as vagas disponíveis
      },
    },
  }
)

export default Reservation
