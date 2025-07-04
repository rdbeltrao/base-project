import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../../services/auth.service'
import { generateToken, setCookieHeader, clearCookieHeader, extractTokenFromCookies } from '../../config/jwt'
import type { SessionUser } from '@test-pod/database'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as SessionUser
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = generateToken(user)
      setCookieHeader(res, token)
      res.json({ user, token })
    } catch (error) {
      console.error('Error during login:', error)
      res.status(500).json({ message: 'Error during login' })
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const result = await this.authService.registerUser({ name, email, password })

      setCookieHeader(res, result.token)
      res.status(201).json(result)
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof Error && error.message === 'Email already in use') {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error during registration' })
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const { token } = req.body
      const sessionUser = await this.authService.verifyUserToken(token)

      if (!sessionUser) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      res.json({ user: sessionUser })
    } catch (error) {
      console.error('Token verification error:', error)
      res.status(401).json({ message: 'Invalid token' })
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user as SessionUser
      res.json({ user })
    } catch (error) {
      console.error('Error fetching profile:', error)
      res.status(500).json({ message: 'Error fetching profile' })
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.user as SessionUser
      const { name } = req.body

      const result = await this.authService.updateProfile(id, { name })

      setCookieHeader(res, result.token)
      res.json(result)
    } catch (error) {
      console.error('Error updating profile:', error)
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Erro ao atualizar perfil' })
    }
  }

  async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as SessionUser
      const sessionUser = await this.authService.getUserForAuthentication(user.id)

      if (!sessionUser) {
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
        return res.redirect(`${authUrl}/login?error=session_error`)
      }

      const token = generateToken(sessionUser)
      setCookieHeader(res, token)

      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
      res.redirect(`${authUrl}/dashboard`)
    } catch (error) {
      console.error('Error during Google authentication:', error)
      const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
      res.redirect(`${authUrl}/login?error=auth_failed`)
    }
  }

  async checkAuth(req: Request, res: Response) {
    // If this controller method is reached, passport.authenticate('jwt') was successful.
    // req.user should be populated by Passport.
    const user = req.user as SessionUser;
    if (user) {
      res.json({ authenticated: true, user });
    } else {
      // This case should ideally not be reached if passport.authenticate fails,
      // as it would send a 401 response itself.
      res.status(401).json({ authenticated: false, message: "Authentication failed or user not found in session." });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      clearCookieHeader(res)
      res.json({ message: 'Logout successful' })
    } catch (error) {
      console.error('Error during logout:', error)
      res.status(500).json({ message: 'Error during logout' })
    }
  }

  async getGoogleConfig(req: Request, res: Response) {
    const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    res.json({ enabled: isGoogleConfigured })
  }

  async getGoogleStatus(req: Request, res: Response) {
    try {
      const user = req.user as SessionUser
      // This would need to be implemented in a service
      res.json({
        isConnected: false, // Placeholder
        hasValidToken: false, // Placeholder
      })
    } catch (error) {
      console.error('Error checking Google connection status:', error)
      res.status(500).json({ message: 'Error checking Google connection status' })
    }
  }
}