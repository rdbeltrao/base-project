jest.mock('jose', () => ({
  jwtVerify: jest.fn().mockImplementation(async (token, _secret) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token')
    }

    if (token.includes('admin')) {
      return { payload: { roles: ['admin'] } }
    } else {
      return { payload: { roles: ['user'] } }
    }
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockImplementation(async () => 'mocked-jwt-token'),
  })),
}))
