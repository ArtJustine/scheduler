import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/50 backdrop-blur-lg">
                <div className="container flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold font-heading tracking-tight">Chiyu</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
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
                        <h1 className="text-4xl font-bold font-heading mb-8">Privacy Policy</h1>
                        <div className="prose prose-lg dark:prose-invert">
                            <p>At Chiyu, we take your privacy seriously. This policy explains how we collect and use your data.</p>

                            <h3>1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as your name, email, and social media credentials.</p>

                            <h3>2. How We Use Information</h3>
                            <p>We use your information to provide, maintain, and improve our services.</p>

                            <h3>3. Data Security</h3>
                            <p>We implement appropriate security measures to protect your personal information.</p>

                            <h3>4. Third-Party Services</h3>
                            <p>We may share data with third-party service providers (e.g., social media platforms) as required to deliver our service.</p>

                            <h3>5. Contact Us</h3>
                            <p>If you have any questions about this policy, please contact us.</p>
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
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-sm font-medium hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
