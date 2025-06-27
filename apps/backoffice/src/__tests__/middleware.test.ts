import { redirectMiddleware } from '../middleware'

describe('Backoffice redirectMiddleware', () => {
  const mockSecret = 'test-secret-key'
  const mockAuthUrl = 'http://localhost:3001'

  it('should redirect to login when token is undefined', async () => {
    const result = await redirectMiddleware(undefined, mockSecret, mockAuthUrl)

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/login')
  })

  it('should redirect to login when token is invalid', async () => {
    const invalidToken = 'invalid-token'

    const result = await redirectMiddleware(invalidToken, mockSecret, mockAuthUrl)

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/login')
  })

  it('should redirect to access-denied when user does not have admin role', async () => {
    const token = 'valid-user-token'

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl)

    expect(result.redirect).toBe(true)
    expect(result.destination?.toString()).toBe('http://localhost:3001/access-denied')
  })

  it('should not redirect when user has admin role', async () => {
    const token = 'valid-admin-token'

    const result = await redirectMiddleware(token, mockSecret, mockAuthUrl)

    expect(result.redirect).toBe(false)
    expect(result.destination?.toString()).toBe('http://localhost:3001/dashboard')
  })
})
