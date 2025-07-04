import { Request, Response } from 'express'
import { UserService } from '../../services/user.service'
import type { SessionUser } from '@test-pod/database'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async getUsers(req: Request, res: Response) {
    try {
      const currentUser = req.user as SessionUser
      const users = await this.userService.getAllUsers(currentUser.id)
      res.json(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ message: 'Error fetching users' })
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(req.params.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      res.status(500).json({ message: 'Error fetching user' })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, roleIds } = req.body
      const user = await this.userService.createUser({ name, email, password, roleIds })
      res.status(201).json(user)
    } catch (error) {
      console.error('Error creating user:', error)
      if (error instanceof Error && error.message === 'Email already in use') {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error creating user' })
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { name, email, password, active, roleIds } = req.body
      const user = await this.userService.updateUser(req.params.id, {
        name,
        email,
        password,
        active,
        roleIds,
      })
      res.json(user)
    } catch (error) {
      console.error('Error updating user:', error)
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error updating user' })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await this.userService.deleteUser(req.params.id)
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting user:', error)
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error deleting user' })
    }
  }

  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await this.userService.getAllRoles()
      res.json(roles)
    } catch (error) {
      console.error('Error fetching roles:', error)
      res.status(500).json({ message: 'Error fetching roles' })
    }
  }
}