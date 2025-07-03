import { redirectMiddleware } from '../redirect-middleware'
import { jwtVerify } from 'jose'
import { userHasPermission } from '@test-pod/auth-shared/utils'

// Mock das dependências
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

jest.mock('@test-pod/auth-shared/utils', () => ({
  userHasPermission: jest.fn(),
}))

// Mock do navItems
jest.mock('@/lib/menu-items', () => ({
  navItems: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Users',
      href: '/dashboard/users',
      permissions: ['user.manage'],
      icon: 'Users',
    },
    {
      title: 'Roles',
      href: '/dashboard/roles',
      permissions: ['role.manage'],
      icon: 'Shield',
    },
  ],
}))

describe('Backoffice redirectMiddleware', () => {
  const mockSecret = 'test-secret-key'
  const mockAuthUrl = 'http://localhost:3001'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login when token is undefined', async () => {
    const result = await redirectMiddleware(undefined, mockSecret, mockAuthUrl, '/dashboard')

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/login')
    expect(jwtVerify).not.toHaveBeenCalled()
  })

  it('should redirect to login when token is invalid', async () => {
    const invalidToken = 'invalid-token'

    ;(jwtVerify as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'))

    const result = await redirectMiddleware(invalidToken, mockSecret, mockAuthUrl, '/dashboard')

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/login')
    expect(jwtVerify).toHaveBeenCalledTimes(1)
  })

  it('should redirect to access-denied when user does not have admin role', async () => {
    const token = 'valid-user-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: { roles: ['user'] },
    })

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard')

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/access-denied')
    expect(jwtVerify).toHaveBeenCalledTimes(1)
  })

  it('should allow access to dashboard when user has admin role', async () => {
    const token = 'valid-admin-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: { roles: ['admin'] },
    })
    ;(userHasPermission as jest.Mock).mockReturnValueOnce(true)

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard')

    expect(result.redirect).toBe(false)
    expect(result.destination).toBeUndefined()
    expect(jwtVerify).toHaveBeenCalledTimes(1)
    expect(userHasPermission).toHaveBeenCalledTimes(1)
  })

  it('should redirect to access-denied when user lacks required permissions for users page', async () => {
    const token = 'valid-admin-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: { roles: ['admin'] },
    })
    ;(userHasPermission as jest.Mock).mockReturnValueOnce(false)

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard/users')

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/access-denied')
    expect(jwtVerify).toHaveBeenCalledTimes(1)
    expect(userHasPermission).toHaveBeenCalledWith({ roles: ['admin'] }, ['user.manage'])
  })

  it('should allow access to users page when user has required permissions', async () => {
    const token = 'valid-admin-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: {
        roles: ['admin'],
        permissions: ['user.manage'],
      },
    })
    ;(userHasPermission as jest.Mock).mockReturnValueOnce(true)

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard/users')

    expect(result.redirect).toBe(false)
    expect(result.destination).toBeUndefined()
    expect(jwtVerify).toHaveBeenCalledTimes(1)
    expect(userHasPermission).toHaveBeenCalledWith(
      { roles: ['admin'], permissions: ['user.manage'] },
      ['user.manage']
    )
  })

  it('should redirect to access-denied when user lacks required permissions for roles page', async () => {
    const token = 'valid-admin-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: { roles: ['admin'] },
    })
    ;(userHasPermission as jest.Mock).mockReturnValueOnce(false)

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard/roles')

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/access-denied')
    expect(jwtVerify).toHaveBeenCalledTimes(1)
    expect(userHasPermission).toHaveBeenCalledWith({ roles: ['admin'] }, ['role.manage'])
  })

  it('should allow access to roles page when user has required permissions', async () => {
    const token = 'valid-admin-token'

    ;(jwtVerify as jest.Mock).mockResolvedValueOnce({
      payload: {
        roles: ['admin'],
        permissions: ['role.manage'],
      },
    })
    ;(userHasPermission as jest.Mock).mockReturnValueOnce(true)

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl, '/dashboard/roles')

    expect(result.redirect).toBe(false)
    expect(result.destination).toBeUndefined()
    expect(jwtVerify).toHaveBeenCalledTimes(1)
    expect(userHasPermission).toHaveBeenCalledWith(
      { roles: ['admin'], permissions: ['role.manage'] },
      ['role.manage']
    )
  })
})
