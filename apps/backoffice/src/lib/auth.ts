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

const cookieName = (typeof window !== 'undefined' && (window as any).process?.env?.NEXT_PUBLIC_COOKIE_NAME) || 'authToken'
const authUrl = (typeof window !== 'undefined' && (window as any).process?.env?.NEXT_PUBLIC_AUTH_URL) || 'http://localhost:3001'
const backendUrl = (typeof window !== 'undefined' && (window as any).process?.env?.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:3000'

/**
 * Get auth token from cookies
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  let authCookie: string | undefined
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].trim().indexOf(`${cookieName}=`) === 0) {
      authCookie = cookies[i]
      break
    }
  }
  
  return authCookie ? authCookie.split('=')[1] : null
}

/**
 * Verify if the current token is valid
 */
export async function verifyToken(): Promise<{ valid: boolean; user?: SessionUser }> {
  const token = getAuthToken()
  
  if (!token) {
    return { valid: false }
  }

  try {
    const response = await fetch(`${backendUrl}/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return { valid: true, user: data.user }
    }
    
    return { valid: false }
  } catch (error) {
    console.error('Token verification error:', error)
    return { valid: false }
  }
}

/**
 * Check if user has specific permission via API
 */
export async function checkPermissionAPI(permission: string): Promise<boolean> {
  const token = getAuthToken()
  
  if (!token) {
    return false
  }

  try {
    const response = await fetch(`${backendUrl}/api/auth/check-permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ permission })
    })

    if (response.ok) {
      const data = await response.json()
      return data.hasPermission
    }
    
    return false
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Client-side route protection
 */
export function redirectToAuth(currentPath: string) {
  if (typeof window !== 'undefined') {
    window.location.href = `${authUrl}/login?redirect=${encodeURIComponent(currentPath)}`
  }
}

/**
 * Check if user is authenticated and redirect if not
 */
export async function requireAuth(currentPath: string): Promise<SessionUser | null> {
  const { valid, user } = await verifyToken()
  
  if (!valid) {
    redirectToAuth(currentPath)
    return null
  }
  
  return user || null
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: SessionUser): boolean {
  if (!user || !user.roles) return false
  
  return user.roles.some(role => 
    typeof role === 'string' ? role === 'admin' : role.name === 'admin'
  )
}

/**
 * Verifica se o usuário tem uma permissão específica
 * @param user Usuário da sessão
 * @param permission Permissão a ser verificada (ex: 'user.read')
 * @returns boolean
 */
export function hasPermission(user: SessionUser, permission: string): boolean {
  if (!user || !user.roles) {
    return false
  }

  // Verifica se algum dos papéis do usuário tem a permissão solicitada
  return user.roles.some(role => {
    if (typeof role === 'string') {
      return false
    }
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
  if (!user || !user.roles || permissions.length === 0) {
    return false
  }

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
