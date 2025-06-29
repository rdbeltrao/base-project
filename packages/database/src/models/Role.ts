import {
  Model,
  DataTypes,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
} from 'sequelize'
import sequelize from '../db'

import User from './User'
import Permission from './Permission'

interface RoleAttributes {
  id: number
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

type RoleCreationAttributes = Optional<
  RoleAttributes,
  'id' | 'description' | 'active' | 'createdAt' | 'updatedAt'
>

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: number
  declare name: string
  declare description: string
  declare active: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare addUser: BelongsToManyAddAssociationMixin<User, number>
  declare getUsers: BelongsToManyGetAssociationsMixin<User>
  declare hasUser: BelongsToManyHasAssociationMixin<User, number>
  declare readonly users?: User[]

  declare addPermission: BelongsToManyAddAssociationMixin<Permission, number>
  declare getPermissions: BelongsToManyGetAssociationsMixin<Permission>
  declare hasPermission: BelongsToManyHasAssociationMixin<Permission, number>
  declare readonly permissions?: Permission[]

  static associate() {
    this.belongsToMany(User, {
      through: 'user_roles',
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    })

    this.belongsToMany(Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    })
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'roles',
    modelName: 'Role',
    scopes: {
      actives: { where: { active: true } },
    },
  }
)

export default Role
