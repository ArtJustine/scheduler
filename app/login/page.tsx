"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Check for success message from signup
  useEffect(() => {
    const successMessage = searchParams.get("success")
    if (successMessage) {
      toast({
        title: "Account created successfully",
        description: "Please log in with your new credentials",
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Add a slight delay to show the loading animation
      await new Promise((resolve) => setTimeout(resolve, 800))

      const result = await signIn(email, password)
      if (result.user) {
        // Show success animation before redirecting
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        })

        // Add a slight delay before redirecting
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle different Firebase error codes
      let errorMessage = "Authentication failed. Please check your credentials and try again."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      }

      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center">
        <Calendar className="h-6 w-6 mr-2" />
        <span className="font-bold">SocialScheduler</span>
      </Link>

      <div className="w-full max-w-md">
        <Card className="w-full max-w-md border-muted/30 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>

          {error && (
            <CardContent className="pt-0">
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-input/50 focus-visible:ring-primary/70"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-input/50 focus-visible:ring-primary/70"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full relative" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
