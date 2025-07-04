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
 * Client-side route protection for auth redirects
 */
export function redirectToLogin(currentPath: string) {
  if (typeof window !== 'undefined') {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
  }
}

/**
 * Client-side route protection for authenticated users
 */
export function redirectToDashboard() {
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard'
  }
}

/**
 * Check if user is authenticated and redirect accordingly
 */
export async function handleAuthRedirect(currentPath: string): Promise<SessionUser | null> {
  const { valid, user } = await verifyToken()
  
  // If on root path
  if (currentPath === '/') {
    if (valid) {
      redirectToDashboard()
    } else {
      redirectToLogin(currentPath)
    }
    return null
  }
  
  // If on login/register pages
  if (currentPath.indexOf('/login') === 0 || currentPath.indexOf('/register') === 0) {
    if (valid) {
      redirectToDashboard()
      return null
    }
    return null
  }
  
  // If on dashboard or other protected routes
  if (currentPath.indexOf('/dashboard') === 0) {
    if (!valid) {
      redirectToLogin(currentPath)
      return null
    }
    return user || null
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
 * Set auth token cookie
 */
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${cookieName}=${token}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 days
  }
}

/**
 * Remove auth token cookie
 */
export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}