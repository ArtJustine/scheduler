"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChange } from "@/lib/firebase/auth"

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
    // Listen to real Firebase Auth changes
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Redirect logic for authentication
  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access protected routes
      const isAuthRoute = pathname && (pathname.startsWith("/login") || pathname.startsWith("/signup"))
      const isWaitlistRoute = pathname === "/waitlist" || pathname === "/thank-you"
      const isPublicRoute = pathname === "/" || isAuthRoute || isWaitlistRoute || pathname?.startsWith("/privacy") || pathname?.startsWith("/terms")

      if (!user && !isPublicRoute) {
        router.push("/login")
      }

      // If user is logged in and trying to access auth routes
      if (user && isAuthRoute) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, pathname, router])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
