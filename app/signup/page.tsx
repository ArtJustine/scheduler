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
import { signupUser } from "@/lib/data-service"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)

      // Pass all required fields to signupUser
      await signupUser(name, email, password)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup error:", error)
      // User-friendly error messages
      let message = error.message || "Failed to sign up. Please try again."
      if (message.includes("auth/missing-password")) {
        message = "Please enter a password."
      } else if (message.includes("auth/invalid-email")) {
        message = "Please enter a valid email address."
      } else if (message.includes("auth/weak-password")) {
        message = "Password should be at least 6 characters."
      } else if (message.includes("auth/email-already-in-use")) {
        message = "An account with that email already exists. Please log in."
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 py-20">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="container relative z-10 flex items-center justify-center">
          <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold font-heading">Create Account</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/5 border-white/10" />
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
                    className="bg-white/5 border-white/10"
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
                    className="bg-white/5 border-white/10"
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
                    className="bg-white/5 border-white/10"
                  />
                </div>

                {error && <div className="text-sm text-red-500">{error}</div>}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/5 pt-6">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login
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
