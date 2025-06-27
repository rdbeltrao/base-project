import { Router } from 'express'
import { Role, Permission } from '@test-pod/database'
import { authenticate, hasPermission } from '../middleware/auth.middleware'

const router: Router = Router()

router.get('/', authenticate, hasPermission('role.manage'), async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    })
    res.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ message: 'Error fetching roles' })
  }
})

router.get('/:id', authenticate, hasPermission('role.manage'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    })

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    res.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    res.status(500).json({ message: 'Error fetching role' })
  }
})

router.post('/', authenticate, hasPermission('role.manage'), async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body

    // Check if role with name already exists
    const existingRole = await Role.findOne({ where: { name: name } })
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already in use' })
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      active: true,
    })

    // Add permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({
        where: {
          id: permissionIds,
        },
      })

      if (permissions.length > 0) {
        await Promise.all(permissions.map(permission => role.addPermission(permission)))
      }
    }

    // Return role with permissions
    const createdRole = await Role.findByPk(role.id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    })

    res.status(201).json(createdRole)
  } catch (error) {
    console.error('Error creating role:', error)
    res.status(500).json({ message: 'Error creating role' })
  }
})

router.put('/:id', authenticate, hasPermission('role.manage'), async (req, res) => {
  try {
    const { name, description, active, permissionIds } = req.body
    const roleId = req.params.id

    // Find role
    const role = await Role.findByPk(roleId)
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    // Check if name is already in use by another role
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        where: {
          name: name,
          id: { $ne: roleId },
        },
      })
      if (existingRole) {
        return res.status(400).json({ message: 'Role name already in use' })
      }
    }

    if (name) {
      role.name = name
    }
    if (description !== undefined) {
      role.description = description
    }
    if (active !== undefined) {
      role.active = active
    }

    await role.save()

    if (permissionIds) {
      const currentPermissions = await role.getPermissions()

      // Remover todas as permissões atuais
      if (currentPermissions.length > 0) {
        // Usando a API de associação do Sequelize
        await (role as any).setPermissions([])
      }

      if (permissionIds.length > 0) {
        const permissions = await Permission.findAll({
          where: {
            id: permissionIds,
          },
        })

        if (permissions.length > 0) {
          await Promise.all(permissions.map(permission => role.addPermission(permission)))
        }
      }
    }

    const updatedRole = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
        },
      ],
    })

    res.json(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    res.status(500).json({ message: 'Error updating role' })
  }
})

router.delete('/:id', authenticate, hasPermission('role.delete'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id)
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    role.active = false

    await role.save()
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting role:', error)
    res.status(500).json({ message: 'Error deleting role' })
  }
})

router.get('/permissions/all', authenticate, hasPermission('role.manage'), async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      attributes: ['id', 'resource', 'action', 'description'],
    })
    res.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    res.status(500).json({ message: 'Error fetching permissions' })
  }
})

export default router
