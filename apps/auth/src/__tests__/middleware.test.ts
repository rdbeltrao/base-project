import { redirectMiddleware } from '../middleware'
import { SignJWT } from 'jose'

describe('Auth redirectMiddleware', () => {
  const mockSecret = 'test-secret-key'
  const mockUrl = 'http://localhost:3001'

  describe('Login path', () => {
    it('should redirect to dashboard when token is valid and path is /login', async () => {
      const secretBuffer = new TextEncoder().encode(mockSecret)
      const token = await new SignJWT({ userId: '123' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(secretBuffer)

      const result = await redirectMiddleware(token, '/login', mockUrl, mockSecret)

      expect(result.redirect).toBe(true)
      expect(result.destination?.toString()).toBe('http://localhost:3001/dashboard')
    })

    it('should not redirect when token is undefined and path is /login', async () => {
      const result = await redirectMiddleware(undefined, '/login', mockUrl, mockSecret)

      expect(result.redirect).toBe(false)
      expect(result.destination).toBeUndefined()
    })
  })

  describe('Dashboard path', () => {
    it('should redirect to login when token is undefined and path is /dashboard', async () => {
      const result = await redirectMiddleware(undefined, '/dashboard', mockUrl, mockSecret)

      expect(result.redirect).toBe(true)
      expect(result.destination?.toString()).toBe('http://localhost:3001/login')
    })

    it('should redirect to login when token is invalid and path is /dashboard', async () => {
      const invalidToken = 'invalid-token'

      const result = await redirectMiddleware(invalidToken, '/dashboard', mockUrl, mockSecret)

      expect(result.redirect).toBe(true)
      expect(result.destination?.toString()).toBe('http://localhost:3001/login')
    })

    it('should not redirect when token is valid and path is /dashboard', async () => {
      const secretBuffer = new TextEncoder().encode(mockSecret)
      const token = await new SignJWT({ userId: '123' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(secretBuffer)

      const result = await redirectMiddleware(token, '/dashboard', mockUrl, mockSecret)

      expect(result.redirect).toBe(false)
      expect(result.destination).toBeUndefined()
    })
  })

  it('should not redirect for other paths', async () => {
    const result = await redirectMiddleware(undefined, '/other-path', mockUrl, mockSecret)

    expect(result.redirect).toBe(false)
    expect(result.destination).toBeUndefined()
  })
})
