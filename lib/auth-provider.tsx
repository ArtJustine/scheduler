"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MOCK_USER } from "@/lib/mock-data"

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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // For demo purposes, always set the mock user
    setTimeout(() => {
      setUser(MOCK_USER)
      setLoading(false)
    }, 500)

    // In a real implementation, this would use the onAuthStateChange function
    // const unsubscribe = onAuthStateChange((user) => {
    //   setUser(user)
    //   setLoading(false)
    // })
    // return unsubscribe
  }, [])

  // Redirect logic for authentication
  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access protected routes
      if (!user && pathname && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
        router.push("/login")
      }

      // If user is logged in and trying to access auth routes
      if (user && pathname && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, pathname, router])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
