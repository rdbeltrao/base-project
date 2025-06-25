import { Role, Permission } from '../../src/models';
import sequelize from '../../src/db';

describe('Permission Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a permission', async () => {
    const permission = await Permission.create({
      resource: 'dashboard',
      action: 'view',
      description: 'Can view dashboard'
    });

    expect(permission).toBeDefined();
    expect(permission.id).toBeDefined();
    expect(permission.resource).toBe('dashboard');
    expect(permission.action).toBe('view');
    expect(permission.description).toBe('Can view dashboard');
    expect(permission.active).toBe(true);
  });

  it('should associate permissions with roles', async () => {
    const viewUsersPermission = await Permission.create({
      resource: 'users',
      action: 'view',
      description: 'Can view users'
    });

    const editUsersPermission = await Permission.create({
      resource: 'users',
      action: 'edit',
      description: 'Can edit users'
    });

    const adminRole = await Role.create({
      name: 'super_admin',
      description: 'Super Administrator'
    });

    const managerRole = await Role.create({
      name: 'manager',
      description: 'Manager'
    });

    await viewUsersPermission.addRole(adminRole);
    await viewUsersPermission.addRole(managerRole);
    await editUsersPermission.addRole(adminRole);
    const viewPermissionRoles = await viewUsersPermission.getRoles();
    expect(viewPermissionRoles).toHaveLength(2);
    expect(viewPermissionRoles.map(r => r.name).sort()).toEqual(['super_admin', 'manager'].sort());

    const editPermissionRoles = await editUsersPermission.getRoles();
    expect(editPermissionRoles).toHaveLength(1);
    expect(editPermissionRoles[0].name).toBe('super_admin');

    const adminRolePermissions = await adminRole.getPermissions();
    expect(adminRolePermissions).toHaveLength(2);
    expect(adminRolePermissions.map(p => `${p.resource}.${p.action}`).sort()).toEqual(['users.view', 'users.edit'].sort());

    const managerRolePermissions = await managerRole.getPermissions();
    expect(managerRolePermissions).toHaveLength(1);
    expect(managerRolePermissions[0].resource).toBe('users');
    expect(managerRolePermissions[0].action).toBe('view');
  });
});
