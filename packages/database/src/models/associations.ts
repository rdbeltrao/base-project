import User from './User'
import Role from './Role'
import Permission from './Permission'
import Event from './Event'
import Reservation from './Reservation'

export function initializeAssociations() {
  User.associate()
  Role.associate()
  Permission.associate()
  Event.associate()
  Reservation.associate()
}
