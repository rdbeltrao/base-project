import { Router } from 'express'
import { User, Role, SessionUser } from '@test-pod/database'
import { authenticate, hasPermission } from '../middleware/auth.middleware'
import { userHasPermission } from '../utils/permissions'

const router: Router = Router()

router.get('/', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const showInactive = await userHasPermission((req.user as SessionUser).id, 'user.view_inactive')

    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
      ...(showInactive ? {} : { where: { active: true } }),
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
})

router.get('/:id', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Error fetching user' })
  }
})

router.post('/', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const { name, email, password, roleIds } = req.body

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email: email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      active: true,
    })

    // Add roles if provided
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({
        where: {
          id: roleIds,
        },
      })

      if (roles.length > 0) {
        await Promise.all(roles.map(role => user.addRole(role)))
      }
    }

    // Return user with roles
    const createdUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
    })

    res.status(201).json(createdUser)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error creating user' })
  }
})

router.put('/:id', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const { name, email, password, active, roleIds } = req.body
    const userId = req.params.id

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email: email,
          id: { $ne: userId },
        },
      })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }

    if (name) {
      user.name = name
    }
    if (email) {
      user.email = email
    }
    if (password) {
      user.password = password
    }
    if (active !== undefined) {
      user.active = active
    }

    await user.save()

    if (roleIds) {
      const currentRoles = await user.getRoles()

      if (currentRoles.length > 0) {
        await user.removeRoles(currentRoles)
      }

      if (roleIds.length > 0) {
        const roles = await Role.findAll({
          where: {
            id: roleIds,
          },
        })

        if (roles.length > 0) {
          await Promise.all(roles.map(role => user.addRole(role)))
        }
      }
    }

    const updatedUser = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ['password'] },
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Error updating user' })
  }
})

router.delete('/:id', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.active = false

    await user.save()
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Error deleting user' })
  }
})

router.get('/roles/all', authenticate, hasPermission('user.manage'), async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'description'],
    })
    res.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ message: 'Error fetching roles' })
  }
})

export default router
