import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/50 backdrop-blur-lg">
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
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                                Join Waitlist
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-20">
                    <div className="container px-6 max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold font-heading mb-8">Terms of Service</h1>
                        <div className="prose prose-lg dark:prose-invert">
                            <p>Welcome to Chiyu. By using our website and services, you agree to these Terms of Service.</p>

                            <h3>1. Acceptance of Terms</h3>
                            <p>By accessing or using our service, you agree to be bound by these terms.</p>

                            <h3>2. Use of Service</h3>
                            <p>You agree to use Chiyu only for lawful purposes and in accordance with these Terms.</p>

                            <h3>3. User Accounts</h3>
                            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>

                            <h3>4. Content</h3>
                            <p>You retain all rights to the content you post using Chiyu.</p>

                            <h3>5. Termination</h3>
                            <p>We reserve the right to terminate or suspend your account at our sole discretion.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full py-8 border-t border-border/50 bg-background/50 backdrop-blur-lg">
                <div className="container px-6 flex flex-col sm:flex-row items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 mb-4 sm:mb-0">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Chiyu</span>
                    </Link>
                    <nav className="flex gap-6">
                        <Link href="/terms" className="text-sm font-medium hover:text-primary transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground text-sm hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
