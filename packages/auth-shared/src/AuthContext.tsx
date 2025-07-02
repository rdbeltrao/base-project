'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, removeCookie } from './cookies'
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
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>
  logout: (redirectUrl?: string) => Promise<void>
  getToken: () => string | undefined
  updateProfile: (updatedUser: { name: string }) => void
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
  const [token, setToken] = useState<string | undefined>()
  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getCookie({ cookieName })

      if (storedToken) {
        try {
          setIsLoading(true)

          const decodedToken = await decodeJWT(storedToken)

          if (decodedToken && decodedToken.user) {
            setUser(decodedToken.user as SessionUser)
            setToken(storedToken)
          } else {
            const response = await fetch(`${apiUrl}/api/auth/profile`, {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            })

            if (!response.ok) {
              throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data?.user) {
              setUser(data.user as SessionUser)
              setToken(storedToken)
            } else {
              removeCookie({ cookieName, domain })
            }
          }
        } catch (_error) {
          console.error('Auth check error:', _error)
          removeCookie({ cookieName, domain })
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [apiUrl, domain, cookieName])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Para incluir cookies na resposta
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data?.token) {
        const authToken = data.token
        // Cookie já foi definido pelo backend via Set-Cookie header
        setToken(authToken)

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
    console.log({ redirectUrl })
    setIsLoading(true)

    try {
      // Chamar a rota de logout local para limpar o cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Error during logout:', error)
      // Fallback: remover cookie manualmente se a requisição falhar
      removeCookie({ cookieName, domain })
    }

    setToken(undefined)
    setUser(null)
    setIsLoading(false)
    window.location.href = redirectUrl
  }

  const getToken = () => {
    return token || getCookie({ cookieName })
  }

  const updateProfile = async (updatedUser: { name: string }) => {
    const token = getToken()

    if (!token) {
      return
    }
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: updatedUser.name }),
      credentials: 'include', // Para incluir cookies na resposta
    })

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    const responseData = await response.json()

    if (responseData?.user) {
      setUser(responseData.user)
      // Cookie já foi atualizado pelo backend via Set-Cookie header
      if (responseData?.token) {
        setToken(responseData.token)
      }
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
