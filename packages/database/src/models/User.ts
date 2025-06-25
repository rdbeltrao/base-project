import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';
import bcrypt from "bcryptjs";

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

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public active!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
        tableName: 'User',
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
