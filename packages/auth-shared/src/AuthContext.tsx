'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCookie, removeCookie, setCookie } from './cookies'

export interface User {
  id: string
  name?: string
  email: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: (redirectUrl?: string) => Promise<void>
  getToken: () => string | undefined
  updateProfile: (updatedUser: { name: string }) => void
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | undefined>()
  const isAuthenticated = !!user

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getCookie({ cookieName })

      if (storedToken) {
        try {
          setIsLoading(true)
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
            setUser(data.user)
            setToken(storedToken)
          } else {
            removeCookie({ cookieName, domain })
          }
        } catch (_error) {
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

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data?.token) {
        const authToken = data.token
        setCookie(authToken, { cookieName, domain })
        setToken(authToken)

        if (data?.user) {
          setUser(data.user)
        }

        if (data?.user?.roles.includes('admin')) {
          window.location.href = `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/dashboard`
        }

        return { success: true }
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

    if (token) {
      removeCookie({ cookieName, domain })
      setToken(undefined)
      setUser(null)
      setIsLoading(false)
      window.location.href = redirectUrl
    } else {
      setIsLoading(false)
      window.location.href = redirectUrl
    }
  }

  const getToken = () => {
    return token || getCookie({ cookieName })
  }

  const updateProfile = async (updatedUser: { name: string }) => {
    const token = getToken()

    if (!token) {
      return
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: updatedUser.name }),
    })

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    const responseData = await response.json()

    if (responseData?.user) {
      setUser(responseData.user)
      setToken(token)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    updateProfile,
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
