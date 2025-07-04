import { NextFunction, Request, Response } from 'express';
import { jwtVerify, JWTPayload } from 'jose';
import { SessionUser } from '@test-pod/database'; // Assuming this type can be imported
// If navItems and userHasPermission are needed and can be refactored to not depend on Next.js context,
// they could be imported from a shared location. For now, focusing on role check.
// import { navItems, NavItem } from '@/lib/menu-items'; // This path is from Next.js app
// import { userHasPermission } from '@test-pod/auth-shared/utils'; // This should be fine

const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
// const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'; // For redirects, not used here

interface AuthenticatedRequest extends Request {
  user?: SessionUser; // Using SessionUser if it aligns with JWT payload structure
}

async function verifyToken(token: string, secret: string): Promise<SessionUser | null> {
  const secretBuffer = new TextEncoder().encode(secret);
  try {
    const { payload } = await jwtVerify(token, secretBuffer);
    // Perform a type assertion if you are confident about the payload structure
    return payload as unknown as SessionUser;
  } catch (_error) {
    return null;
  }
}

/**
 * This middleware is primarily intended to protect backend API routes
 * specifically for the backoffice.
 * It checks for a valid JWT, ensures the user has an 'admin' role,
 * and can be extended for more granular permission checks if needed.
 */
export async function protectBackofficeApi(requiredPermissions?: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies[cookieName];

    if (!token) {
      // If no token, and this is an API call, it's a 401.
      // UI redirects to login are handled client-side.
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    const userPayload = await verifyToken(token, jwtSecret);

    if (!userPayload) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    req.user = userPayload;

    // Check for admin role (basic requirement for backoffice)
    if (!userPayload.roles?.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Admin role required.' });
    }

    // TODO: More granular permission checks if `requiredPermissions` are provided
    // This would require refactoring or relocating `userHasPermission` and `navItems`
    // to be usable in the backend environment.
    // For example:
    // if (requiredPermissions && requiredPermissions.length > 0) {
    //   const hasRequiredPermissions = userHasPermission(userPayload, requiredPermissions);
    //   if (!hasRequiredPermissions) {
    //     return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    //   }
    // }

    next();
  };
}

// Example usage in an Express route file for backoffice APIs:
// import { protectBackofficeApi } from '../middleware/backofficeApiAuth';
// router.get('/some-data', protectBackofficeApi(), async (req, res) => { ... });
// router.post('/critical-action', protectBackofficeApi(['edit_settings']), async (req, res) => { ... });
