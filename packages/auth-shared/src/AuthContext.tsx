'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { SessionUser } from '@test-pod/database'
import { userHasPermission } from './utils'

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: SessionUser }>
  logout: (redirectUrl?: string) => Promise<void>
  getToken: () => string | undefined
  updateProfile: (
    profileData: Partial<SessionUser>
  ) => Promise<{ success: boolean; user?: SessionUser }>
  hasPermissions: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | undefined>()
  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        const response = await fetch('/api/session', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data?.isAuthenticated && data?.user) {
          setUser(data.user as SessionUser)
          setToken(data.token)
        } else {
          setUser(null)
          setToken(undefined)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
        setToken(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro no login')
      }

      const data = await response.json()

      if (data?.user && data?.token) {
        setUser(data.user as SessionUser)
        setToken(data.token)
        return { success: true, user: data.user }
      } else {
        throw new Error('Dados de login inválidos')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async (redirectUrl: string = '/login') => {
    setIsLoading(true)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(undefined)
      setIsLoading(false)
      window.location.href = redirectUrl
    }
  }

  const getToken = () => {
    return token
  }

  const updateProfile = async (profileData: Partial<SessionUser>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      const data = await response.json()

      if (data?.user) {
        setUser(data.user as SessionUser)
        if (data.token) {
          setToken(data.token)
        }
        return { success: true, user: data.user }
      } else {
        throw new Error('Dados de perfil inválidos')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const hasPermissions = (requiredPermissions: string[]): boolean => {
    return userHasPermission(user as SessionUser, requiredPermissions)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    updateProfile,
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
