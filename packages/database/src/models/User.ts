import {
  Model,
  DataTypes,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
} from 'sequelize'
import sequelize from '../db'
import bcrypt from 'bcryptjs'

import Role from './Role'
import Permission from './Permission'
import Reservation from './Reservation'
import Event from './Event'

interface UserAttributes {
  id: number
  name: string
  email: string
  password: string
  active: boolean
  googleId?: string
  googleAccessToken?: string
  googleRefreshToken?: string
  googleTokenExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'active' | 'createdAt' | 'updatedAt'>

export interface SessionUser extends Omit<UserAttributes, 'password'> {
  roles?: string[]
  permissions?: string[]
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare name: string
  declare email: string
  declare password: string
  declare active: boolean
  declare googleId?: string
  declare googleAccessToken?: string
  declare googleRefreshToken?: string
  declare googleTokenExpiry?: Date
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  declare addRole: BelongsToManyAddAssociationMixin<Role, number>
  declare getRoles: BelongsToManyGetAssociationsMixin<Role>
  declare hasRole: BelongsToManyHasAssociationMixin<Role, number>
  declare removeRole: BelongsToManyRemoveAssociationMixin<Role, number>
  declare removeRoles: BelongsToManyRemoveAssociationsMixin<Role, number>

  declare readonly roles?: Role[]
  declare readonly user_reservations?: Reservation[]
  declare readonly events?: Event[]

  static associate() {
    this.hasMany(Reservation, {
      foreignKey: 'user_id',
      as: 'reservations',
    })
    this.hasMany(Event, {
      foreignKey: 'user_id',
      as: 'events',
    })
    this.belongsToMany(Role, {
      through: 'user_roles',
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    })
  }

  async hasPermission(permission: string): Promise<boolean> {
    const [resource, action] = permission.split('.')
    const roles = this.roles ?? (await this.getRoles({ include: [Permission] }))
    return roles.some(role =>
      role.permissions?.some(p => p.action === action && p.resource === resource)
    )
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for Google auth users
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    googleAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'users',
    modelName: 'User',
    scopes: {
      actives: { where: { active: true } },
    },
    hooks: {
      beforeCreate: (user: UserCreationAttributes) => {
        // Only hash password if it's provided (Google auth might not have a password)
        if (user.password) {
          user.password = bcrypt.hashSync(user.password, 10)
        }
      },
    },
  }
)

export default User
