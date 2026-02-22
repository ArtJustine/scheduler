"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Send, Mail, User, MessageSquare } from "lucide-react"
import { submitHelpRequest } from "@/lib/firebase/help"

export default function HelpPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await submitHelpRequest({ name, email, subject, message })
            setSuccess(true)
            setName("")
            setEmail("")
            setSubject("")
            setMessage("")
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <SiteHeader />

            <main className="flex-1 pt-24 pb-20">
                <section>
                    <div className="container px-6 max-w-2xl mx-auto">
                        <div className="text-left mb-12">
                            <h1 className="text-4xl font-bold font-heading mb-4">How can we help?</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Have a question about Chiyu Social? Our team is here to support your creative journey.
                                Send us a message and we'll get back to you as soon as possible.
                            </p>
                        </div>

                        {success ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-12 text-center animate-in fade-in zoom-in duration-500">
                                <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                                <p className="text-muted-foreground mb-8">
                                    Thank you for reaching out. We've received your request and will respond shortly.
                                </p>
                                <Button
                                    onClick={() => setSuccess(false)}
                                    variant="outline"
                                    className="rounded-xl px-8"
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold ml-1">Your Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="h-12 pl-11 rounded-xl bg-muted/50 border-muted/20 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="h-12 pl-11 rounded-xl bg-muted/50 border-muted/20 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-sm font-bold ml-1">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="How can we help you?"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-muted/20 focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-bold ml-1">Message</Label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us what's on your mind..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            className="min-h-[150px] pl-11 pt-4 rounded-xl bg-muted/50 border-muted/20 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="rounded-xl">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] gap-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    )
}
