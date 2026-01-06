"use client"

import Link from "next/link"
import { Calendar, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"

export function SiteHeader() {
    const { user } = useAuth()
    const pathname = usePathname()
    const isDashboard = pathname?.startsWith("/dashboard")

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
            <div className="container flex h-16 items-center px-6">
                {/* Logo - Start */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold font-heading tracking-tight">Chiyu</span>
                    </Link>
                </div>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
                    {isDashboard ? (
                        <>
                            <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Overview
                            </Link>
                            <Link href="/dashboard/posts" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard/posts' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Posts
                            </Link>
                            <Link href="/dashboard/analytics" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard/analytics' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Analytics
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                About
                            </Link>
                            <Link href="/waitlist" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Join Waitlist
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Side Actions - End */}
                <div className="flex-1 flex justify-end items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-4">
                        <ModeToggle />
                        {user ? (
                            <Link href={isDashboard ? "/" : "/dashboard"}>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">
                                    {isDashboard ? "Exit Dashboard" : "Dashboard"}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium hover:text-primary">
                                    Login
                                </Link>
                                <Link href="/signup">
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ModeToggle />
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader className="text-left">
                                    <SheetTitle className="flex items-center space-x-2">
                                        <Calendar className="h-6 w-6 text-primary" />
                                        <span className="text-xl font-bold">Chiyu</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4 mt-8">
                                    {isDashboard ? (
                                        <>
                                            <Link href="/dashboard" className="text-lg font-medium hover:text-primary transition-colors">
                                                Overview
                                            </Link>
                                            <Link href="/dashboard/posts" className="text-lg font-medium hover:text-primary transition-colors">
                                                Posts
                                            </Link>
                                            <Link href="/dashboard/analytics" className="text-lg font-medium hover:text-primary transition-colors">
                                                Analytics
                                            </Link>
                                            <Link href="/dashboard/profile" className="text-lg font-medium hover:text-primary transition-colors">
                                                Profile
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/features" className="text-lg font-medium hover:text-primary transition-colors">
                                                Features
                                            </Link>
                                            <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                                                About
                                            </Link>
                                            <Link href="/waitlist" className="text-lg font-medium hover:text-primary transition-colors">
                                                Join Waitlist
                                            </Link>
                                        </>
                                    )}
                                    <hr className="border-border" />
                                    {user ? (
                                        <div className="flex flex-col space-y-3">
                                            <Link href={isDashboard ? "/" : "/dashboard"} className="w-full">
                                                <Button className="w-full bg-primary text-primary-foreground">{isDashboard ? "Exit Dashboard" : "Dashboard"}</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col space-y-3">
                                            <Link href="/login" className="w-full">
                                                <Button variant="outline" className="w-full">Login</Button>
                                            </Link>
                                            <Link href="/signup" className="w-full">
                                                <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
