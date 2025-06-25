import bcrypt from 'bcryptjs';
import User from '../../src/models/User';
import sequelize from '../../src/db';

describe('User', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('deve criar um usuário com sucesso', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: '123'
        };

        const user = await User.create(userData);

        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.name).toBe(userData.name);
        expect(user.email).toBe(userData.email);
        expect(user.active).toBe(true);
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
    });

    it('deve criptografar a senha antes de salvar', async () => {
        const userData = {
            name: 'Password Test',
            email: 'password@example.com',
            password: '123'
        };

        const user = await User.create(userData);

        expect(user.password).not.toBe(userData.password);

        const isPasswordValid = bcrypt.compareSync(userData.password, user.password);
        expect(isPasswordValid).toBe(true);
    });

    it('deve rejeitar um e-mail inválido', async () => {
        const userData = {
            name: 'Invalid Email',
            email: 'invalid-email',
            password: '123'
        };

        await expect(User.create(userData)).rejects.toThrow();
    });

    it('deve buscar usuários ativos usando o escopo', async () => {
        await User.create({
            name: 'Active User',
            email: 'active@example.com',
            password: '123',
            active: true
        });

        await User.create({
            name: 'Inactive User',
            email: 'inactive@example.com',
            password: '123',
            active: false
        });

        const activeUsers = await User.scope('actives').findAll();

        expect(activeUsers.length).toBeGreaterThanOrEqual(1);
        expect(activeUsers.every(user => user.active === true)).toBe(true);
    });
});
