import {
  Model,
  DataTypes,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
} from 'sequelize'
import sequelize from '../db'

// Importação de tipo apenas (sem importação de módulo circular)
import type Role from './Role'

// Interface para os atributos do Permission
interface PermissionAttributes {
  id: number
  resource: string
  action: string
  description?: string
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'description' | 'active' | 'createdAt' | 'updatedAt'
>

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: number
  public resource!: string
  public action!: string
  public description!: string
  public active!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Associações com Role
  public addRole!: BelongsToManyAddAssociationMixin<Role, number>
  public getRoles!: BelongsToManyGetAssociationsMixin<Role>
  public hasRole!: BelongsToManyHasAssociationMixin<Role, number>
  public readonly roles?: Role[]
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
