import type { SessionUser } from '@test-pod/database'

export const userHasPermission = (user: SessionUser, permissions: string[]): boolean => {
  if (!user || !user.roles) {
    return false
  }

  if (!permissions || permissions.length === 0) {
    return true
  }

  if (user.permissions && Array.isArray(user.permissions)) {
    return permissions.every(
      permission => user.permissions && user.permissions.includes(permission)
    )
  }

  return permissions.every(permission => {
    const [resource, action] = permission.split('.')
    return (
      user.roles &&
      user.roles.some((role: any) =>
        role.permissions?.some((p: any) => p.resource === resource && p.action === action)
      )
    )
  })
}
