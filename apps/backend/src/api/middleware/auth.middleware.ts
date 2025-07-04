import { Request, Response, NextFunction } from 'express'
import passport from '../config/passport'
import { userHasPermission } from '../utils/permissions'
import type { SessionUser } from '@test-pod/database'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: SessionUser) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    req.user = user
    next()
  })(req, res, next)
}

export const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      const hasPermission = await userHasPermission((req.user as SessionUser).id, permission)

      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
      }

      next()
    } catch (error) {
      console.error('Error checking permissions:', error)
      return res.status(500).json({ message: 'Error checking permissions' })
    }
  }
}
