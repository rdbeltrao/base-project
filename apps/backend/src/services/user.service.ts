import { UserRepository } from '../repositories/user.repository'
import { RoleRepository } from '../repositories/role.repository'
import { userHasPermission } from '../utils/permissions'

export class UserService {
  private userRepository: UserRepository
  private roleRepository: RoleRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.roleRepository = new RoleRepository()
  }

  async getAllUsers(currentUserId: number) {
    const showInactive = await userHasPermission(currentUserId, 'user.delete')
    return this.userRepository.findAll(showInactive)
  }

  async getUserById(id: string) {
    return this.userRepository.findById(id)
  }

  async createUser(userData: { name: string; email: string; password: string; roleIds?: number[] }) {
    // Check if email already exists
    const emailExists = await this.userRepository.checkEmailExists(userData.email)
    if (emailExists) {
      throw new Error('Email already in use')
    }

    // Create user
    const user = await this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })

    // Assign roles if provided
    if (userData.roleIds && userData.roleIds.length > 0) {
      await this.userRepository.addRolesToUser(user, userData.roleIds)
    }

    // Return user with roles
    return this.userRepository.findById(user.id)
  }

  async updateUser(id: string, userData: { name?: string; email?: string; password?: string; active?: boolean; roleIds?: number[] }) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== user.email) {
      const emailExists = await this.userRepository.checkEmailExists(userData.email, id)
      if (emailExists) {
        throw new Error('Email already in use')
      }
    }

    // Update user basic info
    await this.userRepository.update(id, {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      active: userData.active,
    })

    // Update roles if provided
    if (userData.roleIds !== undefined) {
      const updatedUser = await this.userRepository.findById(id)
      if (updatedUser) {
        await this.userRepository.replaceUserRoles(updatedUser, userData.roleIds)
      }
    }

    // Return updated user with roles
    return this.userRepository.findById(id)
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    return this.userRepository.deactivate(id)
  }

  async getAllRoles() {
    return this.roleRepository.findAll()
  }
}