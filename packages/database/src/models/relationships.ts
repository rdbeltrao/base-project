import User from './User'
import Role from './Role'
import Permission from './Permission'
import Event from './Event'
import Reservation from './Reservation'

User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
})

Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
})

Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
})

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
})

// Event associations
Event.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

User.hasMany(Event, {
  foreignKey: 'user_id',
  as: 'events',
})

// Reservation associations
Reservation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

Reservation.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

User.hasMany(Reservation, {
  foreignKey: 'user_id',
  as: 'reservations',
})

Event.hasMany(Reservation, {
  foreignKey: 'event_id',
  as: 'reservations',
})

export { User, Role, Permission, Event, Reservation }
