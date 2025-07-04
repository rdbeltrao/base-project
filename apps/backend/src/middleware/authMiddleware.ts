import { NextFunction, Request, Response } from 'express';
import { jwtVerify, JWTPayload } from 'jose';

const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken';
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  const secretBuffer = new TextEncoder().encode(secret);
  try {
    const { payload } = await jwtVerify(token, secretBuffer);
    return payload;
  } catch (_error) {
    return null;
  }
}

/**
 * This middleware is primarily intended to protect backend API routes.
 * It checks for a valid JWT in cookies. If valid, it attaches the user payload
 * to `req.user`. If invalid or not present for a protected route,
 * it returns a 401 Unauthorized error.
 *
 * It does NOT handle UI redirects (e.g., /dashboard -> /login) as that logic
 * is complex without knowing which app (auth, backoffice) a non-API request
 * is for. UI redirects should be handled client-side after checking auth status
 * via an API call.
 */
export async function protectApi(allowedRoles?: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // This middleware should be applied selectively to routes that need protection.
    // Example: app.use('/api/protected-route', protectApi(['admin']), specificRouteHandler);

    const token = req.cookies[cookieName];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    const userPayload = await verifyToken(token, jwtSecret);

    if (!userPayload) {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    req.user = userPayload;

    // Role-based access control
    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = (userPayload.roles as string[]) || []; // Assuming roles are in the JWT payload
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
      }
    }

    next();
  };
}

// Example of how you might use this in app.ts:
// import { protectApi } from './middleware/authMiddleware';
// ...
// app.get('/api/auth/profile', protectApi(), (req: AuthenticatedRequest, res) => {
//   res.json({ user: req.user });
// });
//
// app.get('/api/admin/data', protectApi(['admin']), (req: AuthenticatedRequest, res) => {
//   // Only users with 'admin' role can access this
//   res.json({ data: "sensitive admin data" });
// });

// The previous, broader authMiddleware that tried to handle UI redirects
// has been removed as it's not feasible without app differentiation.
// Client apps will call API endpoints (some protected by protectApi)
// and handle their own UI routing based on API responses.
