import { Role } from '@test-pod/database'

export class RoleRepository {
  async findAll() {
    return Role.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'description'],
    })
  }

  async findById(id: string | number) {
    return Role.findByPk(id)
  }

  async findByName(name: string) {
    return Role.findOne({ where: { name } })
  }

  async create(roleData: { name: string; description?: string }) {
    return Role.create({
      name: roleData.name,
      description: roleData.description,
      active: true,
    })
  }

  async update(id: string | number, roleData: Partial<{ name: string; description: string; active: boolean }>) {
    const role = await Role.findByPk(id)
    if (!role) {
      return null
    }

    if (roleData.name) role.name = roleData.name
    if (roleData.description) role.description = roleData.description
    if (roleData.active !== undefined) role.active = roleData.active

    await role.save()
    return role
  }

  async delete(id: string | number) {
    const role = await Role.findByPk(id)
    if (!role) {
      return null
    }
    
    role.active = false
    await role.save()
    return role
  }
}