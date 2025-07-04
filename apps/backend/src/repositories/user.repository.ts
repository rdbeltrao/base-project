import { User, Role, Sequelize } from '@test-pod/database'

const { Op } = Sequelize

export class UserRepository {
  async findAll(includeInactive = false) {
    return User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
      ...(includeInactive ? {} : { where: { active: true } }),
    })
  }

  async findById(id: string | number) {
    return User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
    })
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } })
  }

  async create(userData: { name: string; email: string; password: string; active?: boolean }) {
    return User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      active: userData.active ?? true,
    })
  }

  async update(id: string | number, userData: Partial<{ name: string; email: string; password: string; active: boolean }>) {
    const user = await User.findByPk(id)
    if (!user) {
      return null
    }

    if (userData.name) user.name = userData.name
    if (userData.email) user.email = userData.email
    if (userData.password) user.password = userData.password
    if (userData.active !== undefined) user.active = userData.active

    await user.save()
    return user
  }

  async checkEmailExists(email: string, excludeId?: string | number) {
    const where: any = { email }
    if (excludeId) {
      where.id = { [Op.ne]: excludeId }
    }
    
    const user = await User.findOne({ where })
    return !!user
  }

  async addRolesToUser(user: any, roleIds: number[]) {
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({
        where: { id: roleIds },
      })
      await Promise.all(roles.map(role => user.addRole(role)))
    }
  }

  async replaceUserRoles(user: any, roleIds: number[]) {
    const currentRoles = await user.getRoles()
    if (currentRoles.length > 0) {
      await user.removeRoles(currentRoles)
    }

    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({
        where: { id: roleIds },
      })
      await Promise.all(roles.map(role => user.addRole(role)))
    }
  }

  async deactivate(id: string | number) {
    const user = await User.findByPk(id)
    if (!user) {
      return null
    }
    
    user.active = false
    await user.save()
    return user
  }
}