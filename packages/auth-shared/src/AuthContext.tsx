'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { removeCookie } from './cookies'
import type { SessionUser } from '@test-pod/database'
import * as jose from 'jose'
import { userHasPermission } from './utils'

async function decodeJWT(token: string) {
  try {
    const { payload } = await jose
      .jwtVerify(token, new TextEncoder().encode(''), {
        requiredClaims: [],
        clockTolerance: '1000y',
      })
      .catch(() => {
        return { payload: jose.decodeJwt(token) }
      })

    return payload
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: SessionUser | null) => void
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>
  logout: (redirectUrl?: string) => Promise<void>
  hasPermissions: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  cookieName?: string
  domain?: string
  apiUrl?: string
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  cookieName,
  domain,
  apiUrl,
}) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${apiUrl}/api/auth/check-auth`, {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            return
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data?.authenticated && data?.user) {
          setUser(data.user as SessionUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [apiUrl])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data?.token) {
        const authToken = data.token

        const decodedToken = await decodeJWT(authToken)
        if (decodedToken && decodedToken.user) {
          setUser(decodedToken.user as SessionUser)
        } else if (data?.user) {
          setUser(data.user as SessionUser)
        }

        const userData = decodedToken?.user || data?.user

        const redirectUrl = (() => {
          if (userData?.roles?.some((role: string) => role === 'admin')) {
            return `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/dashboard`
          }
          return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        })()

        return { success: true, redirectUrl }
      }

      return { success: false, error: 'Credenciais inválidas' }
    } catch (error: any) {
      console.error('Erro durante o login:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ocorreu um erro durante o login.',
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (redirectUrl: string = '/login') => {
    setIsLoading(true)

    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Error during logout:', error)
      removeCookie({ cookieName, domain })
    }

    setUser(null)
    setIsLoading(false)
    window.location.href = redirectUrl
  }

  const hasPermissions = (requiredPermissions: string[]): boolean => {
    return userHasPermission(user as SessionUser, requiredPermissions)
  }

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
