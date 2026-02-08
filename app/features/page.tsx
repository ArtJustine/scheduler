"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Zap, ThumbsUp, Instagram, Youtube, Video, ArrowRight, Star, Globe, Clock, Layers, ShieldCheck, Mail, CheckCircle2, Edit3, BarChart3, Facebook, Twitter, Linkedin, Users, Rocket, Smartphone, Link as LucideLink } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function FeaturesPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
            <SiteHeader />

            {/* Hero Section */}
            <section className="relative w-full py-6 md:py-12 lg:py-16 pt-16 lg:pt-24 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-[-10%] w-[1000px] h-[1000px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[140px] opacity-20 animate-pulse" />
                </div>

                <div className="container relative z-10 px-6">
                    <div className="max-w-5xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tighter text-slate-900 dark:text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
                            The Engine <br />
                            of <span className="text-primary italic">Distribution.</span>
                        </h1>
                        <p className="text-base md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            We&apos;ve engineered the world&apos;s most precise social media distribution engine. Master your presence across 12+ platforms from a single, high-performance command center.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                            <Link href="/waitlist">
                                <Button size="lg" className="rounded-full bg-primary text-primary-foreground text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Platforms */}
            <section className="w-full py-12 bg-background border-b border-border/50">
                <div className="container px-6">
                    <div className="flex flex-col items-center space-y-8">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">Supported Platforms</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 transition-all duration-500">
                            <div className="flex flex-col items-center space-y-2 group opacity-40">
                                <img src="/instagram.webp" alt="Instagram" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter">Instagram</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group">
                                <img src="/youtube.webp" alt="YouTube" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter text-primary">YouTube</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group opacity-40">
                                <img src="/facebook.webp" alt="Facebook" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter">Facebook</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group opacity-40">
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                    <img src="/x.webp" alt="X" className="h-6 w-6 object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter">X</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group opacity-40">
                                <img src="/linkedin.webp" alt="LinkedIn" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter">LinkedIn</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group">
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                    <img src="/tiktok.webp" alt="TikTok" className="h-6 w-6 object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter text-primary">TikTok</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 group opacity-40">
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                                    <img src="/threads.webp" alt="Threads" className="h-6 w-6 object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-medium hidden md:block uppercase tracking-tighter">Threads</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Efficiency First Section */}
            <section className="w-full py-24 bg-background relative border-y border-border/50">
                <div className="container px-6">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Layers className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold font-heading">Multi-Platform Engine</h3>
                            <p className="text-muted-foreground italic">Sync once, publish everywhere.</p>
                            <p className="text-muted-foreground">
                                One dashboard to rule them all. Sync your content across YouTube, TikTok, and LinkedIn with zero friction. Our engine handles the technical specifications for each platform automatically.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold font-heading">Enterprise Security</h3>
                            <p className="text-muted-foreground italic">Your trust is our priority.</p>
                            <p className="text-muted-foreground">
                                Chiyu uses bank-grade encryption and official API integrations to ensure your accounts and content are protected. No password sharing, no insecure workarounds—just pure, secure connectivity.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold font-heading">AI-Driven Optimization</h3>
                            <p className="text-muted-foreground italic">Data-backed engagement.</p>
                            <p className="text-muted-foreground">
                                Don't just post—outperform. Our human-like AI analyzes engagement patterns to suggest the perfect hashtags, captions, and posting times tailored specifically to your audience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Capabilities - New Section */}
            <section className="w-full py-24 bg-secondary/30 text-foreground overflow-hidden transition-colors duration-500">
                <div className="container px-6">
                    <div className="max-w-4xl mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6">Built for the next generation of <span className="text-primary italic">creators.</span></h2>
                        <p className="text-xl text-slate-600 dark:text-gray-400">We've engineered Chiyu to solve the specific bottlenecks of modern distribution, starting with where the attention is now.</p>
                    </div>

                    <div className="grid gap-24">
                        {/* 1. The Short-Form Specialist */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
                                    <Smartphone className="h-4 w-4" />
                                    <span>The Short-Form Specialist</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight">Dominating the <br /><span className="text-primary text-italic">Vertical Era</span></h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">Built for the Scroll</h4>
                                        <p className="text-gray-400 leading-relaxed">
                                            Seamlessly publish to TikTok and YouTube Shorts with precise vertical formatting and custom thumbnail selection. Ensure your video captures attention in every feed with our specialized optimization engine.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all" />
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
                                    <Video className="h-32 w-32 text-primary/50 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                                        <Youtube className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                                        <span className="text-xs font-bold font-mono">9:16 OPTIMIZED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. The Professional Edge */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative group">
                                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
                                    <Linkedin className="h-32 w-32 text-blue-500/50 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-20">
                                        <div className="h-4 w-48 bg-white/20 rounded-full" />
                                        <div className="h-4 w-32 bg-white/20 rounded-full" />
                                        <div className="h-4 w-40 bg-white/20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 space-y-6">
                                <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-sm font-medium">
                                    <Linkedin className="h-4 w-4" />
                                    <span>The Professional Edge</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight">Elevate Your <br />Professional Brand</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">LinkedIn Leadership</h4>
                                        <p className="text-gray-400 leading-relaxed">
                                            Balance high-energy video content with polished, professional thought leadership posts on the world&apos;s largest professional network. Bridge the gap between creator energy and corporate influence from a single dashboard.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. The Master Calendar */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    <span>The Master Calendar</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight">Command Your <br />Content Timeline</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground mb-2">Visual Multi-Platform Scheduling</h4>
                                        <p className="text-gray-400 leading-relaxed">
                                            Orchestrate your entire strategy with a drag-and-drop calendar and bulk scheduling capabilities. Use AI-powered caption generation to maintain a consistent voice across TikTok, YouTube, and LinkedIn.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full group-hover:bg-purple-500/20 transition-all" />
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 aspect-video flex flex-col space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div className="flex space-x-2">
                                            <div className="h-3 w-3 rounded-full bg-red-500" />
                                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                            <div className="h-3 w-3 rounded-full bg-green-500" />
                                        </div>
                                        <div className="h-4 w-24 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="grid grid-cols-7 gap-2 flex-grow">
                                        {[...Array(14)].map((_, i) => (
                                            <div key={i} className={`rounded-md border border-white/5 ${i === 4 ? 'bg-primary/20 border-primary/50' : 'bg-white/5'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Collaboration & Workflow */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative group">
                                <div className="absolute inset-0 bg-green-500/10 blur-[100px] rounded-full group-hover:bg-green-500/20 transition-all" />
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
                                    <Users className="h-32 w-32 text-green-500/50 group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex -space-x-4">
                                        <div className="h-16 w-16 rounded-full bg-gray-600 border-2 border-slate-950" />
                                        <div className="h-16 w-16 rounded-full bg-gray-500 border-2 border-slate-950" />
                                        <div className="h-16 w-16 rounded-full bg-primary border-2 border-slate-950" />
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2 space-y-6">
                                <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-green-400 text-sm font-medium">
                                    <Users className="h-4 w-4" />
                                    <span>Collaboration & Workflow</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight">Sync Your Team, <br />Secure Your Vision</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">Enterprise-Grade Collaboration</h4>
                                        <p className="text-gray-400 leading-relaxed">
                                            Streamline production with internal teammate notes, a shared media asset library for video files, and multi-user approval workflows. Maintain total control over your brand’s output with robust permission settings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Link-in-Bio Engine */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
                                    <LucideLink className="h-4 w-4" />
                                    <span>Link-in-Bio Engine</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading leading-tight">Your Digital <br />Home Base</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground mb-2">Beautiful, Custom Link Pages</h4>
                                        <p className="text-gray-400 leading-relaxed">
                                            Turn your social traffic into results with a high-performance link-in-bio page. Customize colors, add unlimited links, and track every click directly from your Chiyu dashboard. It's more than a link—it's your command center.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/20 transition-all" />
                                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden">
                                    <div className="w-full max-w-[200px] bg-slate-900 border border-white/10 rounded-[2rem] p-4 shadow-2xl skew-y-3 group-hover:skew-y-0 transition-transform duration-500">
                                        <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-4" />
                                        <div className="space-y-2">
                                            <div className="h-2 w-20 bg-white/20 rounded-full mx-auto" />
                                            <div className="h-2 w-32 bg-white/10 rounded-full mx-auto" />
                                        </div>
                                        <div className="mt-6 space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-8 w-full bg-white/5 border border-white/10 rounded-lg" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Expansion Roadmap */}
                        <div className="mt-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 p-8">
                                <Rocket className="h-24 w-24 text-primary/10 -rotate-12" />
                            </div>
                            <div className="max-w-2xl relative z-10">
                                <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium mb-6">
                                    <span>Coming Soon</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-slate-900 dark:text-white">The Future of Your Distribution</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expanding the Ecosystem</h4>
                                        <p className="text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl">
                                            We&apos;re rapidly building deep integrations for Instagram Reels/Stories, Facebook, and X, alongside advanced Analytics Dashboards. Join now to be first in line for the ultimate all-in-one social powerhouse.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        {['Instagram Reels', 'Facebook', 'X (Twitter)', 'Analytics 2.0', 'Threads API'].map((tag) => (
                                            <span key={tag} className="px-4 py-2 border border-white/10 rounded-full text-sm text-gray-300 bg-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Availability - New Section */}
            <section className="w-full py-24 bg-background relative border-b border-border/50">
                <div className="container px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-foreground">Platform Ecosystem & Roadmap</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Our platform is engineered for rapid evolution. Below is our current connectivity matrix, highlighting live integrations and upcoming features.</p>
                    </div>

                    <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="p-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature/Platform</th>
                                        <th className="p-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">Benefit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {/* Active Now */}
                                    <tr className="bg-primary/5">
                                        <td className="p-6" colSpan={2}>
                                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Active Now</span>
                                        </td>
                                    </tr>
                                    {[
                                        { name: 'YouTube', benefit: 'Command the world\'s largest video stage with precision long-form scheduling.' },
                                        { name: 'YouTube Shorts', benefit: 'Explode your reach with optimized 9:16 vertical distribution.' },
                                        { name: 'TikTok', benefit: 'Own the "For You" feed with seamless, direct-to-platform publishing.' },
                                        { name: 'Universal Dashboard', benefit: 'A bird\'s-eye view of your entire social ecosystem with real-time health tracking.' },
                                        { name: 'Content Planner', benefit: 'Visualize your strategy with our drag-and-drop calendar for effortless feed balance.' },
                                        { name: 'Multi-Platform Engine', benefit: 'Sync content across all channels with zero friction and automatic technical encoding.' },
                                        { name: 'Enterprise Security', benefit: 'Bank-grade encryption and official API integrations to protect your accounts and content.' },
                                        { name: 'Link-in-Bio Builder', benefit: 'Create a beautiful, optimized landing page for your social traffic with zero effort.' }
                                    ].map((item) => (
                                        <tr key={item.name} className="hover:bg-primary/5 transition-colors border-b border-border">
                                            <td className="p-6 font-bold text-foreground">{item.name}</td>
                                            <td className="p-6 text-muted-foreground text-sm">{item.benefit}</td>
                                        </tr>
                                    ))}

                                    {/* Coming Soon */}
                                    <tr className="bg-secondary/20">
                                        <td className="p-6" colSpan={2}>
                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-semibold">Coming Soon</span>
                                        </td>
                                    </tr>
                                    {[
                                        { name: 'LinkedIn', benefit: 'Build professional authority on the world\'s premier business network.' },
                                        { name: 'AI-Driven Content Writer', benefit: 'Generate authentic, engaging captions and content ideas that sound exactly like you.' },
                                        { name: 'SEO Optimization', benefit: 'Rank higher with built-in styling and hashtag recommendations tailored for maximum reach.' },
                                        { name: 'Smart Posts', benefit: 'Natural-feeling posts with automatic formatting and platform-specific rule checking.' },
                                        { name: 'Short-Form Studio', benefit: 'Bulk upload and distribute vertical content across TikTok and YouTube Shorts instantly.' },
                                        { name: 'Team Collaboration', benefit: 'Streamline production with internal notes and multi-user approval workflows.' },
                                        { name: 'Instagram (Reels & Stories)', benefit: 'Master visual storytelling and capture the vertical era at scale.' },
                                        { name: 'Facebook', benefit: 'Reach and engage the world’s most diverse social community effortlessly.' },
                                        { name: 'X (Twitter)', benefit: 'Drive real-time conversations and viral threads with high-velocity posting.' },
                                        { name: 'Pinterest', benefit: 'Tap into high-intent visual discovery and long-term search inspiration.' },
                                        { name: 'Advanced Analytics', benefit: 'Transform raw metrics into a high-performance, data-backed strategy.' },
                                        { name: 'Threads API', benefit: 'Automate your presence on the fastest-growing text-based social network.' }
                                    ].map((item) => (
                                        <tr key={item.name} className="hover:bg-muted/5 transition-colors border-b border-border">
                                            <td className="p-6 font-bold text-foreground/70">{item.name}</td>
                                            <td className="p-6 text-muted-foreground text-sm italic">{item.benefit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="w-full py-20 md:py-32 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
                <div className="container px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-16">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-bold font-heading text-foreground">
                                Your social media, <span className="italic text-primary">effortlessly</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Begin your scheduling journey in three effortless steps
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                            <div className="p-8 rounded-2xl glass-card border border-primary/20 hover:border-primary/50 transition-all group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <Star className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold font-heading mb-3">SEO Optimization</h3>
                                <p className="text-muted-foreground">
                                    Rank higher with built-in styling and hashtag recommendations tailored for maximum reach.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl glass-card border border-primary/20 hover:border-primary/50 transition-all group">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold font-heading mb-3">Human-like AI Generator</h3>
                                <p className="text-muted-foreground">
                                    Generate authentic, engaging captions and content ideas that sound exactly like you.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 pt-8 text-left">
                            {/* Step 1: Create */}
                            <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/20 text-blue-500">
                                    <Edit3 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Create</h3>
                                <p className="text-muted-foreground text-sm">
                                    Design your content with surgical precision across all platforms.
                                </p>
                            </div>

                            {/* Step 2: Schedule */}
                            <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-500/20 text-purple-500">
                                    <Calendar className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Schedule</h3>
                                <p className="text-muted-foreground text-sm">
                                    Pick the best time for maximum reach using our AI-driven insights.
                                </p>
                            </div>

                            {/* Step 3: Publish */}
                            <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 text-green-500">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Publish</h3>
                                <p className="text-muted-foreground text-sm">
                                    Auto-post everywhere instantly with zero friction.
                                </p>
                            </div>

                            {/* Step 4: Analyze */}
                            <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500/20 text-orange-500">
                                    <BarChart3 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Analyze</h3>
                                <p className="text-muted-foreground text-sm">
                                    Track performance and watch your engagement grow in real-time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Features Gallery */}
            <section id="features" className="w-full py-24 bg-slate-50 dark:bg-gradient-to-b dark:from-black dark:to-gray-950 transition-colors duration-500">
                <div className="container px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white">Full-Stack Control</h2>
                        <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">Everything you need to dominate your social media stack, organized into a single, intuitive command center.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Dashboard Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                                <Calendar className="h-16 w-16 text-purple-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Universal Dashboard</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">A bird's-eye view of your entire social ecosystem. Track growth, upcoming posts, and account health in real-time.</p>
                            </div>
                        </div>

                        {/* Content Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                                <Layers className="h-16 w-16 text-pink-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Smart Posts</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Native-feeling posts for every platform. Chiyu automatically formats and pre-checks your content for platform-specific rules.</p>
                            </div>
                        </div>

                        {/* Video Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                                <Youtube className="h-16 w-16 text-red-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Short-Form Studio</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Optimized for TikTok and YouTube Shorts. Bulk upload and let Chiyu handle the distribution across your vertical video channels.</p>
                            </div>
                        </div>

                        {/* Automation Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-gray-200 to-white dark:from-gray-800 dark:to-black rounded-lg flex items-center justify-center">
                                <Clock className="h-16 w-16 text-slate-900 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Precision Scheduling</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Queue posts weeks in advance. Our resilient engine ensures your content goes live even if you're offline.</p>
                            </div>
                        </div>

                        {/* Analytics Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                                <div className="h-16 w-16 border-2 border-green-600 dark:border-green-400/50 rounded-lg flex items-center justify-center">
                                    <div className="h-8 w-8 border-t-2 border-green-600 dark:border-green-400 rounded-full animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Core Insights</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Track your trajectory. Monitor reach and engagement across YouTube, TikTok, and LinkedIn to see where your content hits hardest.</p>
                            </div>
                        </div>

                        {/* Calendar Preview */}
                        <div className="rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 flex flex-col space-y-6 shadow-md dark:shadow-none">
                            <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                                <Calendar className="h-16 w-16 text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Content Planner</h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400">Visualize your content strategy with our drag-and-drop calendar. Balance your feed across all platforms effortlessly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Final CTA Section */}
            < section className="w-full py-20 bg-background border-t border-border/50" >
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground">
                            Ready to automate your empire?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Experience the engine that powers modern distribution.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/waitlist">
                                <Button size="lg" className="rounded-full bg-primary text-primary-foreground text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section >

            <SiteFooter />
        </div >
    )
}
