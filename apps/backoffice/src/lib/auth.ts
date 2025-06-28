interface Permission {
  name: string
  [key: string]: any
}

interface Role {
  id: number
  name: string
  permissions?: Permission[]
  [key: string]: any
}

interface SessionUser {
  id: number
  name: string
  email: string
  roles: Role[] | string[]
  [key: string]: any
}

/**
 * Verifica se o usuário tem uma permissão específica
 * @param user Usuário da sessão
 * @param permission Permissão a ser verificada (ex: 'user.read')
 * @returns boolean
 */
export function hasPermission(user: SessionUser, permission: string): boolean {
  if (!user || !user.roles) return false

  // Verifica se algum dos papéis do usuário tem a permissão solicitada
  return user.roles.some(role => {
    if (typeof role === 'string') return false
    return role.permissions?.some((p: Permission) => p.name === permission)
  })
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões especificadas
 * @param user Usuário da sessão
 * @param permissions Lista de permissões a serem verificadas
 * @returns boolean
 */
export function hasAnyPermission(user: SessionUser, permissions: string[]): boolean {
  if (!user || !user.roles || permissions.length === 0) return false

  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Verifica se o usuário tem uma permissão de gerenciamento
 * Esta função é um helper para verificar permissões de gerenciamento
 * @param user Usuário da sessão
 * @param resource Recurso a ser gerenciado (ex: 'user', 'role', 'event')
 * @returns boolean
 */
export function hasManagePermission(user: SessionUser, resource: string): boolean {
  return hasAnyPermission(user, [
    `${resource}.create`,
    `${resource}.read`,
    `${resource}.update`,
    `${resource}.delete`,
  ])
}
