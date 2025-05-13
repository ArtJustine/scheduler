"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, onAuthStateChange } from "./data-service"

interface AuthContextType {
  user: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if we are in a browser environment
    if (typeof window === "undefined") {
      setLoading(false)
      return () => {}
    }

    try {
      // First, get the current user synchronously if possible
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      }

      // Then set up the auth state listener
      const unsubscribe = onAuthStateChange((authUser) => {
        setUser(authUser)
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Auth provider error:", error)
      setAuthError(error instanceof Error ? error : new Error(String(error)))
      setLoading(false)
      return () => {}
    }
  }, [])

  // If there's an auth error, show a simple error message
  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">{authError.message}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
