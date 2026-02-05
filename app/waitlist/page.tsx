"use client"

import { Calendar, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { firebaseDb } from "@/lib/firebase-client"
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

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
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-white dark:bg-black px-4 py-20 pt-32 transition-colors duration-500">
                {/* Background Gradients */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 dark:bg-primary/30 rounded-full blur-[120px] opacity-30 dark:opacity-50" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] opacity-20 dark:opacity-30" />
                </div>

                <div className="container relative z-10 flex items-center justify-center">
                    <Card className="w-full max-w-lg bg-card border border-border shadow-soft">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center mb-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
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
                                    <h3 className="text-2xl font-bold text-primary font-heading">You're on the list!</h3>
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
                                            className="py-6"
                                        />
                                        {error && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full text-lg py-6 font-bold"
                                    >
                                        {loading ? "Joining..." : "Reserve My Spot"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
