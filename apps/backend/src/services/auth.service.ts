import { UserRepository } from '../repositories/user.repository'
import { RoleRepository } from '../repositories/role.repository'
import { generateToken, verifyToken } from '../config/jwt'
import { getUserForSession } from '../utils/user'
import type { SessionUser } from '@test-pod/database'

export class AuthService {
  private userRepository: UserRepository
  private roleRepository: RoleRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.roleRepository = new RoleRepository()
  }

  async registerUser(userData: { name: string; email: string; password: string }) {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('Email already in use')
    }

    // Create user
    const user = await this.userRepository.create(userData)

    // Assign default role
    const defaultRole = await this.roleRepository.findByName('user')
    if (defaultRole) {
      await this.userRepository.addRolesToUser(user, [defaultRole.id])
    }

    // Get session user
    const sessionUser = await getUserForSession(user.id)
    if (!sessionUser) {
      throw new Error('Error creating session user')
    }

    // Generate token
    const token = generateToken(sessionUser)

    return { user: sessionUser, token }
  }

  async updateProfile(userId: number, profileData: { name: string }) {
    if (!profileData.name || typeof profileData.name !== 'string' || profileData.name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres')
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    await this.userRepository.update(userId, { name: profileData.name.trim() })

    const updatedUser = await getUserForSession(userId)
    if (!updatedUser) {
      throw new Error('Erro ao recuperar dados do usuário')
    }

    const token = generateToken(updatedUser)

    return { user: updatedUser, token }
  }

  async verifyUserToken(token: string): Promise<SessionUser | null> {
    try {
      const decoded = verifyToken(token)
      const sessionUser = await getUserForSession(decoded.id)

      if (!sessionUser || !sessionUser.active) {
        return null
      }

      return sessionUser
    } catch {
      return null
    }
  }

  async getUserForAuthentication(userId: number): Promise<SessionUser | null> {
    return getUserForSession(userId)
  }
}