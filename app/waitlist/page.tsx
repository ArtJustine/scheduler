"use client"

import { Calendar, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { firebaseDb } from "@/lib/firebase-client"
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"

export default function WaitlistPage() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        setError("")

        try {
            if (!firebaseDb) {
                throw new Error("Database not initialized")
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                setError("Invalid email format")
                setLoading(false)
                return
            }

            // Check if email already exists
            const waitlistRef = collection(firebaseDb, "waitlist")
            const q = query(waitlistRef, where("email", "==", email.toLowerCase().trim()))
            const snapshot = await getDocs(q)

            if (!snapshot.empty) {
                setError("This email is already on the waitlist")
                setLoading(false)
                return
            }

            // Add to waitlist
            await addDoc(waitlistRef, {
                email: email.toLowerCase().trim(),
                createdAt: Timestamp.now(),
                status: "pending",
            })

            setSubmitted(true)
        } catch (err: any) {
            console.error("Error adding to waitlist:", err)
            setError("Something went wrong. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointing-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-30" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-30" />
            </div>

            {/* Header - Now White in light mode, Dark in dark mode */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold font-heading tracking-tight">Chiyu</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link href="/waitlist">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">Join Waitlist</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
                <Card className="w-full max-w-lg glass-card border-white/10">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center mb-2">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl md:text-4xl font-bold font-heading">Join the Waitlist</CardTitle>
                        <CardDescription className="text-lg">
                            Chiyu is currently opening to a limited number of creators. Sign up to get early access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="text-center py-8 space-y-4">
                                <h3 className="text-2xl font-bold text-green-400">You're on the list!</h3>
                                <p className="text-muted-foreground">We'll let you know as soon as a spot opens up.</p>
                                <Link href="/">
                                    <Button variant="outline" className="mt-4">Back to Home</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="bg-background/50"
                                    />
                                    {error && (
                                        <p className="text-sm text-red-400">{error}</p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-lg py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                >
                                    {loading ? "Joining..." : "Reserve My Spot"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </main>

            <footer className="w-full py-8 border-t border-border/50 bg-background/50 backdrop-blur-lg relativ z-10">
                <div className="container px-6 flex flex-col sm:flex-row items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 mb-4 sm:mb-0">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Chiyu</span>
                    </Link>
                    <nav className="flex gap-6">
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
