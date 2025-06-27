import { User, Permission } from '@test-pod/database'

export async function userHasPermission(userId: number, permission: string): Promise<boolean> {
  const user = await User.findByPk(userId)
  const [resource, action] = permission.split('.')

  if (!user) {
    return false
  }

  const roles = await user.getRoles({
    include: [
      {
        model: Permission,
        as: 'permissions',
        where: {
          resource,
          action,
        },
        required: true,
      },
    ],
  })

  return roles.length > 0
}

export async function userHasAllPermissions(
  userId: number,
  permissions: Array<string>
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => userHasPermission(userId, permission))
  )

  return results.every(result => result === true)
}

export async function userHasAnyPermission(
  userId: number,
  permissions: Array<string>
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(permission => userHasPermission(userId, permission))
  )

  return results.some(result => result === true)
}
