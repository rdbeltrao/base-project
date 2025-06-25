import { User, Role, Permission } from '../../src/models';
import sequelize from '../../src/db';

describe('Role Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a role', async () => {
    const role = await Role.create({
      name: 'admin',
      description: 'Administrator role'
    });

    expect(role).toBeDefined();
    expect(role.id).toBeDefined();
    expect(role.name).toBe('admin');
    expect(role.description).toBe('Administrator role');
    expect(role.active).toBe(true);
  });

  it('should associate roles with users', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    const role = await Role.create({
      name: 'editor',
      description: 'Editor role'
    });

    await user.addRole(role);

    const userRoles = await user.getRoles();
    expect(userRoles).toHaveLength(1);
    expect(userRoles[0].name).toBe('editor');

    const roleUsers = await role.getUsers();
    expect(roleUsers).toHaveLength(1);
    expect(roleUsers[0].email).toBe('test@example.com');
  });

  it('should associate roles with permissions', async () => {
    const role = await Role.create({
      name: 'moderator',
      description: 'Moderator role'
    });
    const createPermission = await Permission.create({
      resource: 'posts',
      action: 'create',
      description: 'Can create posts'
    });

    const deletePermission = await Permission.create({
      resource: 'posts',
      action: 'delete',
      description: 'Can delete posts'
    });

    await role.addPermission(createPermission);
    await role.addPermission(deletePermission);

    const rolePermissions = await role.getPermissions();
    expect(rolePermissions).toHaveLength(2);
    expect(rolePermissions.map(p => `${p.resource}.${p.action}`).sort()).toEqual(['posts.create', 'posts.delete'].sort());

    const permissionRoles = await createPermission.getRoles();
    expect(permissionRoles).toHaveLength(1);
    expect(permissionRoles[0].name).toBe('moderator');
  });
});
