// Setup global Jest configuration

// Mock database models
jest.mock('@test-pod/database', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    addRole: jest.fn(),
  }
  
  const mockRole = {
    findOne: jest.fn(),
  }
  
  return {
    User: mockUser,
    Role: mockRole,
  }
})
