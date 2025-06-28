import {
  Model,
  DataTypes,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
} from 'sequelize'
import sequelize from '../db'

import type Role from './Role'

interface PermissionAttributes {
  id: number
  resource: string
  action: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'description' | 'active' | 'createdAt' | 'updatedAt'
>

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  declare id: number
  declare resource: string
  declare action: string
  declare description: string
  declare active: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare addRole: BelongsToManyAddAssociationMixin<Role, number>
  declare getRoles: BelongsToManyGetAssociationsMixin<Role>
  declare hasRole: BelongsToManyHasAssociationMixin<Role, number>
  declare readonly roles?: Role[]
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'permissions',
    modelName: 'Permission',
    scopes: {
      actives: { where: { active: true } },
    },
  }
)

export default Permission
