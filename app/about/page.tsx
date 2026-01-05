import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
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

                        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
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
                <section className="py-20 md:py-32 relative overflow-hidden">
                    <div className="container px-6">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-8">
                                About <span className="text-primary">Chiyu</span>
                            </h1>
                            <div className="prose prose-lg dark:prose-invert">
                                <p>
                                    Chiyu was born from a simple idea: social media management shouldn't be a full-time job.
                                    We believe that creators should spend their time creating, not wrestling with scheduling tools and spreadsheets.
                                </p>
                                <p>
                                    Our mission is to provide the most intuitive, powerful, and beautiful scheduling experience on the web.
                                    We combine advanced automation with a premium, user-first design to help you grow your audience effortlessly.
                                </p>
                                <h3>Our Values</h3>
                                <ul>
                                    <li><strong>Simplicity:</strong> We believe less is more.</li>
                                    <li><strong>Design:</strong> Tools should be beautiful and inspiring to use.</li>
                                    <li><strong>Creator First:</strong> We build for the people who create the content.</li>
                                </ul>
                            </div>
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
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
