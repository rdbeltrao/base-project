import { jwtVerify } from 'jose'
import { navItems, NavItem } from '@/lib/menu-items'
import { userHasPermission } from '@test-pod/auth-shared/utils'
import type { SessionUser } from '@test-pod/database'

export async function redirectMiddleware(
  token: string | undefined,
  secret: string,
  authUrl: string,
  pathname: string
): Promise<{ redirect: boolean; destination: URL | undefined }> {
  const secretBuffer = new TextEncoder().encode(secret)

  if (!token) {
    return {
      redirect: true,
      destination: new URL('/login', authUrl),
    }
  }

  try {
    const { payload } = await jwtVerify(token, secretBuffer)

    const { roles } = payload as unknown as SessionUser

    if (!roles?.includes('admin')) {
      return {
        redirect: true,
        destination: new URL('/access-denied', authUrl),
      }
    }

    const allowedPermissions = navItems.find((item: NavItem) => item.href === pathname)?.permissions
    const hasPermission = userHasPermission(
      payload as unknown as SessionUser,
      allowedPermissions || []
    )

    if (!hasPermission) {
      return {
        redirect: true,
        destination: new URL('/access-denied', authUrl),
      }
    }

    return {
      redirect: false,
      destination: undefined,
    }
  } catch (_error) {
    return {
      redirect: true,
      destination: new URL('/login', authUrl),
    }
  }
}
