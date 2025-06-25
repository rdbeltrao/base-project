import { Model, DataTypes, Optional, BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin } from 'sequelize';
import sequelize from '../db';

// Importação de tipos apenas (sem importação de módulo circular)
import type User from './User';
import type Permission from './Permission';

// Interface para os atributos do Role
interface RoleAttributes {
    id: number;
    name: string;
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RoleCreationAttributes
    extends Optional<RoleAttributes, 'id' | 'description' | 'active' | 'createdAt' | 'updatedAt'> { }

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public active!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associações com User
    public addUser!: BelongsToManyAddAssociationMixin<User, number>;
    public getUsers!: BelongsToManyGetAssociationsMixin<User>;
    public hasUser!: BelongsToManyHasAssociationMixin<User, number>;
    public readonly users?: User[];

    // Associações com Permission
    public addPermission!: BelongsToManyAddAssociationMixin<Permission, number>;
    public getPermissions!: BelongsToManyGetAssociationsMixin<Permission>;
    public hasPermission!: BelongsToManyHasAssociationMixin<Permission, number>;
    public readonly permissions?: Permission[];
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
    },
    {
        sequelize,
        tableName: 'Role',
        modelName: 'Role',
        scopes: {
            actives: { where: { active: true } },
        },
    }
);

export default Role;
