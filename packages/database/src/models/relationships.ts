import User from './User';
import Role from './Role';
import Permission from './Permission';

User.belongsToMany(Role, {
  through: 'UserRole',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: 'UserRole',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

Role.belongsToMany(Permission, {
  through: 'RolePermission',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: 'RolePermission',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

export { User, Role, Permission };
