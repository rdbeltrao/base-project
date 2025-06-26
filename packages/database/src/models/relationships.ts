import User from './User'
import Role from './Role'
import Permission from './Permission'

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

export { User, Role, Permission }
