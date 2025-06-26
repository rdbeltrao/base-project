import { User } from '@test-pod/database'
import type { SessionUser } from '@test-pod/database'

export async function getUserForSession(userId: number): Promise<SessionUser | null> {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ['password'],
    },
    include: [
      {
        association: 'roles',
        include: [
          {
            association: 'permissions',
          },
        ],
      },
    ],
  })

  if (!user) {
    return null
  }

  const roles = user.roles?.map(role => role.name) || []
  const permissions =
    user.roles?.flatMap(
      role =>
        role.permissions?.map(permission => `${permission.resource}.${permission.action}`) || []
    ) || []

  const sessionUser: SessionUser = {
    ...user.toJSON(),
    roles,
    permissions,
  }

  return sessionUser
}
