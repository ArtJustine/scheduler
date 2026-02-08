import { Check, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PricingPage() {
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
                        <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm">Login</Button>
                        </Link>
                        <Link href="/waitlist">
                            <Button className="rounded-full bg-primary text-primary-foreground px-6 py-2 h-auto font-bold transition-all hover:scale-105 active:scale-95 border-0">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-20 md:py-32 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
                    <div className="container px-6">
                        <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
                            <h1 className="text-4xl md:text-6xl font-bold font-heading">
                                Simple, transparent <span className="text-primary">pricing</span>
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Start for free, upgrade as you grow. No hidden fees.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Free Plan */}
                            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                                <h3 className="text-xl font-bold font-heading mb-2">Starter</h3>
                                <div className="text-4xl font-bold mb-4">$0 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-muted-foreground mb-8">Perfect for getting started.</p>
                                <Link href="/waitlist">
                                    <Button size="lg" className="w-full rounded-full bg-primary text-primary-foreground text-lg py-6 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                                        Get Started
                                    </Button>
                                </Link>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> 3 Social Accounts</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> 10 Scheduled Posts</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Basic Analytics</li>
                                </ul>
                            </div>

                            {/* Pro Plan */}
                            <div className="p-8 rounded-2xl glass-card border-primary/50 relative transform md:-translate-y-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                                <h3 className="text-xl font-bold font-heading mb-2">Pro</h3>
                                <div className="text-4xl font-bold mb-4 text-primary">$29 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-muted-foreground mb-8">For serious creators.</p>
                                <Link href="/waitlist">
                                    <Button size="lg" className="w-full rounded-full bg-primary text-primary-foreground text-lg py-6 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                                        Get Started
                                    </Button>
                                </Link>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Unlimited Accounts</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Unlimited Scheduled Posts</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Advanced Analytics</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> AI Caption Generator</li>
                                </ul>
                            </div>

                            {/* Business Plan */}
                            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
                                <h3 className="text-xl font-bold font-heading mb-2">Business</h3>
                                <div className="text-4xl font-bold mb-4">$99 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-muted-foreground mb-8">For teams and agencies.</p>
                                <Link href="/waitlist">
                                    <Button size="lg" className="w-full rounded-full bg-primary text-primary-foreground text-lg py-6 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                                        Contact Sales
                                    </Button>
                                </Link>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Everything in Pro</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Team Members</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Priority Support</li>
                                    <li className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-primary" /> Approval Workflows</li>
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
