"use client"

import Link from "next/link"
import { Calendar } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="w-full py-12 border-t border-border/50 bg-background/50 backdrop-blur-lg">
            <div className="container px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/logo-light.png"
                                alt="Chiyu"
                                className="h-8 w-8 object-contain dark:hidden"
                            />
                            <img
                                src="/logo-dark.png"
                                alt="Chiyu"
                                className="h-8 w-8 object-contain hidden dark:block"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                            The truly limitless social media scheduling tool for modern creators.
                        </p>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            About
                        </Link>
                        <Link href="/waitlist" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Waitlist
                        </Link>
                        <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                    </nav>
                </div>

                <div className="mt-12 pt-8 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Chiyu. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <Link href="https://instagram.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                            <img src="/instagram.webp" alt="Instagram" className="h-5 w-5 object-contain opacity-70 hover:opacity-100" />
                        </Link>
                        <Link href="https://x.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                            <div className="bg-white p-1 rounded-md shadow-sm border border-gray-100 flex items-center justify-center">
                                <img src="/x.webp" alt="X" className="h-4 w-4 object-contain" />
                            </div>
                        </Link>
                        <Link href="https://youtube.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                            <img src="/youtube.webp" alt="YouTube" className="h-5 w-5 object-contain opacity-70 hover:opacity-100" />
                        </Link>
                        <Link href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                            <img src="/linkedin.webp" alt="LinkedIn" className="h-5 w-5 object-contain opacity-70 hover:opacity-100" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
