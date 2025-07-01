import { useState, useEffect } from 'react'

interface GoogleConfigState {
  isGoogleEnabled: boolean | null
  isLoading: boolean
}

export function useGoogleConfig(): GoogleConfigState {
  const [isGoogleEnabled, setIsGoogleEnabled] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkGoogleConfig = async () => {
      try {
        const response = await fetch('/api/google-config')
        if (response.ok) {
          const data = await response.json()
          setIsGoogleEnabled(data.enabled)
        } else {
          setIsGoogleEnabled(false)
        }
      } catch (error) {
        console.error('Error checking Google configuration:', error)
        setIsGoogleEnabled(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkGoogleConfig()
  }, [])

  return { isGoogleEnabled, isLoading }
}
