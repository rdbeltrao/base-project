// Importar os modelos primeiro
import User, { SessionUser } from './User'
import Role from './Role'
import Permission from './Permission'

import './relationships'

export { User, Role, Permission }

// Re-exportar tipos explicitamente com 'export type'
export type { SessionUser }
