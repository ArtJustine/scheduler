"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Add a slight delay to show the loading animation
      await new Promise((resolve) => setTimeout(resolve, 800))

      await signUp(email, password, name)

      // Show success toast
      toast({
        title: "Account created successfully",
        description: "You can now log in with your new account",
      })

      // Redirect to login page with success parameter
      router.push("/login?success=true")
    } catch (error: any) {
      console.error("Signup error:", error)

      // Handle different Firebase error codes
      let errorMessage = "Failed to create account. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use. Please use a different email or try logging in."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      }

      setError(errorMessage)

      toast({
        variant: "destructive",
        title: "Signup failed",
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-input/50 focus-visible:ring-primary/70"
                  disabled={isLoading}
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-input/50 focus-visible:ring-primary/70"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
