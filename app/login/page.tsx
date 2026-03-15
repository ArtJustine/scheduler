"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { loginUser, loginWithGoogle } from "@/lib/data-service"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)

      await loginUser(email, password)

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      // User-friendly error messages
      let message = error.message || "Failed to login. Please try again."
      if (message.includes("auth/user-not-found")) {
        message = "No account found with that email. Please sign up."
      } else if (message.includes("auth/wrong-password")) {
        message = "Incorrect password. Please try again."
      } else if (message.includes("auth/invalid-email")) {
        message = "Please enter a valid email address."
      } else if (message.includes("auth/missing-password")) {
        message = "Please enter your password."
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await loginWithGoogle()
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to login with Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted px-4 py-20">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 dark:bg-primary/30 rounded-full blur-[120px] opacity-40 dark:opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] opacity-20 dark:opacity-30" />
        </div>

        <div className="container relative z-10 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold font-heading">Welcome Back</CardTitle>
              <CardDescription>Enter your email and password to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" title="sm" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="text-sm text-red-500">{error}</div>}

                <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground text-xl py-6 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0 shadow-lg shadow-primary/25" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full py-6 h-auto transition-all hover:bg-muted active:scale-95 flex items-center justify-center gap-3 border-muted-foreground/20 shadow-sm"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  <span className="font-semibold text-lg">Google</span>
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/waitlist" className="text-primary hover:underline font-medium">
                  Join the waitlist
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
