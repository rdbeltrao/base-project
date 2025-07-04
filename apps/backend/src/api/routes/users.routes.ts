import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticate, hasPermission } from '../middleware/auth.middleware'

const router: Router = Router()
const userController = new UserController()

// Get all users
router.get(
  '/',
  authenticate,
  hasPermission('user.manage'),
  userController.getUsers.bind(userController)
)

// Get user by ID
router.get(
  '/:id',
  authenticate,
  hasPermission('user.manage'),
  userController.getUserById.bind(userController)
)

// Create new user
router.post(
  '/',
  authenticate,
  hasPermission('user.manage'),
  userController.createUser.bind(userController)
)

// Update user
router.put(
  '/:id',
  authenticate,
  hasPermission('user.manage'),
  userController.updateUser.bind(userController)
)

// Delete user (soft delete)
router.delete(
  '/:id',
  authenticate,
  hasPermission('user.delete'),
  userController.deleteUser.bind(userController)
)

// Get all roles
router.get(
  '/roles/all',
  authenticate,
  hasPermission('user.manage'),
  userController.getAllRoles.bind(userController)
)

export default router