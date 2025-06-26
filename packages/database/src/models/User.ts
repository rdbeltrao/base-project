import { Model, DataTypes, Optional, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin } from 'sequelize';
import sequelize from '../db';
import bcrypt from "bcryptjs";

import type Role from './Role';
import type Permission from './Permission';

// Interface para os atributos do User
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes
    extends Optional<UserAttributes, 'id' | 'active' | 'createdAt' | 'updatedAt'> { }

export interface SessionUser extends Omit<UserAttributes, 'password'> {
    roles?: string[];
    permissions?: string[];
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public active!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associações com Role
    public addRole!: BelongsToManyAddAssociationMixin<Role, number>;
    public getRoles!: BelongsToManyGetAssociationsMixin<Role>;
    public hasRole!: BelongsToManyHasAssociationMixin<Role, number>;

    // Atributo virtual para roles associados
    public readonly roles?: Role[];
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
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
                user.password = bcrypt.hashSync(user.password, 10);
            },
        },
    }
);

export default User;
