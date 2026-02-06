"use client"

import Link from "next/link"
import { Calendar, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function SiteHeader() {
    const { user } = useAuth()
    const pathname = usePathname()
    const isLandingPage = pathname === "/" || pathname === "/features" || pathname === "/about" || pathname === "/blog" || pathname === "/waitlist" || pathname === "/login" || pathname === "/signup"
    const isDashboard = pathname?.startsWith("/dashboard")
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (isLandingPage && !isDashboard) {
        return (
            <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
                <div className="container mx-auto px-6 py-6 md:py-8 flex items-center justify-between">
                    {/* Logo - Top Left */}
                    <div className="pointer-events-auto">
                        <Link href="/" className="flex items-center space-x-3 group animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="w-10 h-10 bg-transparent flex items-center justify-center group-hover:scale-105 transition-transform">
                                {mounted ? (
                                    <>
                                        <img
                                            src="/logo-light.png"
                                            alt="Chiyu"
                                            className="h-10 w-10 object-contain dark:hidden"
                                        />
                                        <img
                                            src="/logo-dark.png"
                                            alt="Chiyu"
                                            className="h-10 w-10 object-contain hidden dark:block"
                                        />
                                    </>
                                ) : (
                                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Floating Pill Menu - Desktop */}
                    <div className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                        <HeaderNav pathname={pathname} />
                    </div>

                    {/* Right Side - Theme/Mobile */}
                    <div className="flex items-center space-x-2 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="hidden md:block">
                            <ModeToggle />
                        </div>

                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 bg-slate-900 dark:bg-slate-800 rounded-full border border-white/10 shadow-lg">
                                        <Menu className="h-6 w-6 text-white" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px]">
                                    <SheetHeader className="text-left">
                                        <SheetTitle className="flex items-center space-x-2">
                                            {mounted ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                                            )}
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="flex flex-col space-y-4 mt-8">
                                        <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                                        <Link href="/features" className="text-lg font-medium hover:text-primary transition-colors">Features</Link>
                                        <Link href="/blog" className="text-lg font-medium hover:text-primary transition-colors">Blog</Link>
                                        <hr className="border-border" />
                                        <Link href="/waitlist" className="w-full">
                                            <Button className="w-full bg-slate-900 text-white rounded-xl">Waitlist</Button>
                                        </Link>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
            <div className="container flex h-16 items-center px-6">
                {/* Logo - Start */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center">
                        {mounted ? (
                            <>
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
                            </>
                        ) : (
                            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                        )}
                    </Link>
                </div>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex flex-1 justify-center items-center">
                    {isDashboard ? (
                        <div className="flex space-x-8">
                            <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Overview
                            </Link>
                            <Link href="/dashboard/posts" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard/posts' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Posts
                            </Link>
                            <Link href="/dashboard/analytics" className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === '/dashboard/analytics' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Analytics
                            </Link>
                        </div>
                    ) : (
                        <HeaderNav pathname={pathname} minimalist />
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
                                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors text-foreground">
                                    Login
                                </Link>
                                <Link href="/waitlist">
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">
                                        Waitlist
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
                            <SheetContent side="right" className="w-[85vw] sm:w-[400px] border-l border-border bg-white/95 dark:bg-black/95 backdrop-blur-2xl p-0">
                                <div className="flex flex-col h-full">
                                    <div className="p-8 pb-4">
                                        <SheetHeader className="text-left">
                                            <SheetTitle className="flex items-center">
                                                {mounted ? (
                                                    <>
                                                        <img
                                                            src="/logo-light.png"
                                                            alt="Chiyu"
                                                            className="h-10 w-10 object-contain dark:hidden"
                                                        />
                                                        <img
                                                            src="/logo-dark.png"
                                                            alt="Chiyu"
                                                            className="h-10 w-10 object-contain hidden dark:block"
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                                                )}
                                            </SheetTitle>
                                        </SheetHeader>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-8 py-6">
                                        <div className="flex flex-col space-y-6">
                                            {isDashboard ? (
                                                <>
                                                    <Link href="/dashboard" className={`text-xl font-semibold transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Overview
                                                    </Link>
                                                    <Link href="/dashboard/posts" className={`text-xl font-semibold transition-colors ${pathname === '/dashboard/posts' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Posts
                                                    </Link>
                                                    <Link href="/dashboard/analytics" className={`text-xl font-semibold transition-colors ${pathname === '/dashboard/analytics' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Analytics
                                                    </Link>
                                                    <Link href="/dashboard/profile" className={`text-xl font-semibold transition-colors ${pathname === '/dashboard/profile' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Profile
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link href="/" className="text-xl font-semibold hover:text-primary transition-colors">
                                                        Home
                                                    </Link>
                                                    <Link href="/features" className={`text-xl font-semibold transition-colors ${pathname === '/features' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Features
                                                    </Link>
                                                    <Link href="/blog" className={`text-xl font-semibold transition-colors ${pathname === '/blog' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Blog
                                                    </Link>
                                                    <Link href="/waitlist" className={`text-xl font-semibold transition-colors ${pathname === '/waitlist' ? 'text-primary' : 'hover:text-primary'}`}>
                                                        Waitlist
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-border/50">
                                            {user ? (
                                                <div className="flex flex-col space-y-4">
                                                    <Link href={isDashboard ? "/" : "/dashboard"} className="w-full">
                                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-2xl shadow-xl shadow-primary/20">
                                                            {isDashboard ? "Exit Dashboard" : "Dashboard"}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col space-y-4">
                                                    <Link href="/login" className="w-full">
                                                        <Button variant="outline" className="w-full h-14 text-lg rounded-2xl border-border/50 bg-background/50">Login</Button>
                                                    </Link>
                                                    <Link href="/waitlist" className="w-full">
                                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-2xl shadow-xl shadow-primary/20">Waitlist</Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-border/50 bg-muted/30">
                                        <p className="text-sm text-muted-foreground">© 2026 Chiyu. Built for creators.</p>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}

function HeaderNav({ pathname, minimalist = false }: { pathname: string | null, minimalist?: boolean }) {
    const [hoveredLink, setHoveredLink] = useState<string | null>(null)

    if (minimalist) {
        return (
            <div className="relative flex items-center space-x-8 h-10">
                <div
                    className="absolute bottom-0 h-0.5 bg-primary transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
                    style={{
                        width: hoveredLink === 'features' ? '60px' : hoveredLink === 'blog' ? '32px' : hoveredLink === 'waitlist' ? '54px' : '0px',
                        left: hoveredLink === 'features' ? '0px' : hoveredLink === 'blog' ? '92px' : hoveredLink === 'waitlist' ? '156px' : '0px',
                        opacity: hoveredLink ? 1 : 0
                    }}
                />
                <Link
                    href="/features"
                    onMouseEnter={() => setHoveredLink('features')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                >
                    Features
                </Link>
                <Link
                    href="/blog"
                    onMouseEnter={() => setHoveredLink('blog')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                >
                    Blog
                </Link>
                <Link
                    href="/waitlist"
                    onMouseEnter={() => setHoveredLink('waitlist')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                >
                    Waitlist
                </Link>
            </div>
        )
    }

    return (
        <nav className="flex items-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-border rounded-full px-2 py-2 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
            <div className="relative flex items-center px-1">
                {/* Sliding background */}
                <div
                    className="absolute h-9 bg-slate-100 dark:bg-white/10 rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) -z-10"
                    style={{
                        width: hoveredLink === 'features' ? '88px' : hoveredLink === 'blog' ? '72px' : '0px',
                        left: hoveredLink === 'features' ? '0px' : hoveredLink === 'blog' ? '88px' : '0px',
                        opacity: hoveredLink ? 1 : 0
                    }}
                />
                <Link
                    href="/features"
                    onMouseEnter={() => setHoveredLink('features')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative z-10 ${pathname === '/features' ? 'text-primary font-bold' : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Features
                </Link>
                <Link
                    href="/blog"
                    onMouseEnter={() => setHoveredLink('blog')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative z-10 ${pathname === '/blog' ? 'text-primary font-bold' : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Blog
                </Link>
            </div>
            <Link href="/waitlist">
                <Button className="rounded-full bg-primary text-white hover:opacity-90 px-6 py-2 h-auto text-sm font-bold border-0 shadow-none">
                    Waitlist
                </Button>
            </Link>
        </nav>
    )
}
