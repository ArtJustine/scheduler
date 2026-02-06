import { Button } from "@/components/ui/button"
import { Calendar, Zap, ThumbsUp, Instagram, Youtube, Video, ArrowRight, Star, CheckCircle2, QrCode, Globe, Clock, Layers, ShieldCheck, Mail, Edit3, BarChart3, Facebook, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <SiteHeader />

      {/* Hero Section - Minimalist Apple-style */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-white dark:bg-black transition-colors duration-500">
        {/* Floating Social Platform Icons - Desktop */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {/* Top Row */}
          <div className="absolute top-[12%] left-[12%] animate-float-slow">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Instagram className="w-12 h-12 text-[#E1306C]" />
            </div>
          </div>
          <div className="absolute top-[8%] left-[48%] animate-float-medium">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Twitter className="w-10 h-10 text-black dark:text-white" />
            </div>
          </div>
          <div className="absolute top-[18%] right-[12%] animate-float-fast">
            <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Youtube className="w-14 h-14 text-red-600" />
            </div>
          </div>

          {/* Middle Row */}
          <div className="absolute top-[48%] left-[8%] animate-float-medium">
            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Video className="w-16 h-16 text-black dark:text-white" />
            </div>
          </div>
          <div className="absolute top-[42%] right-[8%] animate-float">
            <div className="w-28 h-28 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-soft flex items-center justify-center border border-border group hover:scale-105 transition-transform duration-500 pointer-events-auto cursor-help">
              <Facebook className="w-14 h-14 text-[#0668E1]" />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="absolute bottom-[12%] left-[18%] animate-float-fast">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Linkedin className="w-12 h-12 text-[#0077B5]" />
            </div>
          </div>
          <div className="absolute bottom-[8%] right-[22%] animate-float-medium">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-gray-100 dark:border-slate-800 group hover:scale-110 transition-transform duration-500 pointer-events-auto cursor-help">
              <Globe className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-[18%] left-[49%] animate-float">
            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-soft flex items-center justify-center border border-border group hover:scale-105 transition-transform duration-500 pointer-events-auto cursor-help">
              <QrCode className="w-12 h-12 text-foreground" />
            </div>
          </div>
        </div>

        {/* Mobile Icons (Simplified overlay) */}
        <div className="absolute inset-0 pointer-events-none md:hidden opacity-[0.08] dark:opacity-[0.15] overflow-hidden">
          <div className="absolute top-[10%] left-[10%] animate-float-slow">
            <Instagram className="w-12 h-12 text-[#E1306C]" />
          </div>
          <div className="absolute top-[15%] right-[10%] animate-float-fast">
            <Youtube className="w-16 h-16 text-red-600" />
          </div>
          <div className="absolute bottom-[20%] left-[15%] animate-float-medium">
            <Video className="w-20 h-20 text-black dark:text-white" />
          </div>
          <div className="absolute bottom-[10%] right-[15%] animate-float-slow">
            <Twitter className="w-12 h-12 text-black dark:text-white" />
          </div>
        </div>

        <div className="container relative z-10 px-6 pt-24 md:pt-32 pb-12">
          <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-10">
            <h1 className="text-4xl md:text-7xl lg:text-[100px] font-extrabold font-heading tracking-tight text-slate-900 dark:text-white leading-[0.9] md:leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Manage <span className="text-primary italic">All</span> Your <br className="hidden lg:block" />
              Social Media <br className="hidden lg:block" />
              in One Place
            </h1>

            <p className="text-base md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              The ultimate social media scheduler and manager tool for teams and creators. Powerful social media posting tools to plan, schedule, and auto-publish content across 12+ platforms.
            </p>

            <div className="flex justify-center pt-4 md:pt-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/waitlist">
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 h-auto font-bold tracking-tight transition-all hover:scale-105 active:scale-95 border-0">
                  Try Chiyu for free
                </Button>
              </Link>
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
                One dashboard to rule them all. Sync your content across Instagram, YouTube, and TikTok with zero friction. Our engine handles the technical specifications for each platform automatically—re-encoding videos and optimizing aspect ratios in the background.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">Enterprise Security</h3>
              <p className="text-muted-foreground italic">Your trust is our priority.</p>
              <p className="text-muted-foreground">
                Your data is your currency. Chiyu uses bank-grade encryption and official API integrations to ensure your accounts and content are protected. No password sharing, no insecure workarounds—just pure, secure API connectivity.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading">AI-Driven Optimization</h3>
              <p className="text-muted-foreground italic">Data-backed engagement.</p>
              <p className="text-muted-foreground">
                Don't just post—outperform. Our human-like AI analyzes engagement patterns in real-time to suggest the perfect hashtags, captions, and posting times tailored specifically to your unique audience. It learns your voice to save you hours of writing.
              </p>
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

            <div className="grid md:grid-cols-4 gap-6 pt-8">
              {/* Step 1: Create */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/20 text-blue-500 mx-auto">
                  <Edit3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Create</h3>
                <p className="text-muted-foreground text-sm">
                  Design your content with precision.
                </p>
              </div>

              {/* Step 2: Schedule */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-500/20 text-purple-500 mx-auto">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Schedule</h3>
                <p className="text-muted-foreground text-sm">
                  Pick the best time for maximum reach.
                </p>
              </div>

              {/* Step 3: Publish */}
              <div className="space-y-4 p-6 rounded-2xl border border-border bg-card/50 hover:border-primary transition-colors">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Publish</h3>
                <p className="text-muted-foreground text-sm">
                  Auto-post everywhere instantly.
                </p>
              </div>

              {/* Step 4: Analyze */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500/20 text-orange-500 mx-auto">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Analyze</h3>
                <p className="text-muted-foreground text-sm">
                  Track performance across platforms.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Link href="/waitlist">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-lg shadow-primary/25">
                  Join the Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Gallery */}
      <section id="features" className="w-full py-24 bg-gradient-to-b from-black to-gray-950">
        <div className="container px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white">Full-Stack Control</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to dominate your social media stack, organized into a single, intuitive command center.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Dashboard Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-16 w-16 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Universal Dashboard</h4>
                <p className="text-sm text-gray-400">A bird's-eye view of your entire social ecosystem. Track growth, upcoming posts, and account health in real-time.</p>
              </div>
            </div>

            {/* Content Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <Layers className="h-16 w-16 text-pink-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Smart Posts</h4>
                <p className="text-sm text-gray-400">Native-feeling posts for every platform. Chiyu automatically formats and pre-checks your content for platform-specific rules.</p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                <Youtube className="h-16 w-16 text-red-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Short-Form Studio</h4>
                <p className="text-sm text-gray-400">Optimized for Reels, Shorts, and TikTok. Bulk upload and let Chiyu handle the distribution across your video channels.</p>
              </div>
            </div>

            {/* Automation Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                <Clock className="h-16 w-16 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Precision Scheduling</h4>
                <p className="text-sm text-gray-400">Queue posts weeks in advance. Our resilient engine ensures your content goes live even if you're offline.</p>
              </div>
            </div>

            {/* Analytics Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                <div className="h-16 w-16 border-2 border-green-400/50 rounded-lg flex items-center justify-center">
                  <div className="h-8 w-8 border-t-2 border-green-400 rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Pro Insights</h4>
                <p className="text-sm text-gray-400">Stop guessing. Get detailed analytics on reach, engagement, and follower growth to double down on what works.</p>
              </div>
            </div>

            {/* Calendar Preview */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col space-y-6">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-16 w-16 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Content Planner</h4>
                <p className="text-sm text-gray-400">Visualize your content strategy with our drag-and-drop calendar. Balance your feed across all platforms effortlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="w-full py-20 md:py-32 bg-secondary/5">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold font-heading">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about Chiyu.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">Which social media platforms are supported?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Chiyu currently supports official direct publishing to Instagram (Posts, Reels), YouTube (Videos, Shorts), and TikTok. We use official API integrations to ensure your account security and data accuracy. Support for LinkedIn and X (Twitter) is currently in closed beta.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">How does the AI content generator work?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our content engine uses large language models specifically trained on high-performance social media data. It doesn't just "write text"; it analyzes your niche, recommends top-performing hashtags, and generates captions designed to stop the scroll, all while maintaining your unique brand voice.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">Is my account data secure?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Security is our baseline. We never store your social media passwords. All platform connections are handled through OAuth2, meaning you authorize Chiyu via the official apps (Instagram, Google, TikTok). You can revoke access at any time directly from the platform settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">Can I manage a team with Chiyu?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, Chiyu Pro (launching soon) includes team workspaces, approval workflows, and role-based access control. Early bird users will have the opportunity to beta-test team features before the public release.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">Why a waitlist?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To ensure a "limitless" experience for everyone, we are scaling our server infrastructure gradually as we integrate more platforms. Joining the waitlist guarantees you a spot in the next onboarding wave and locks in early-access benefits.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-background border-t border-border/50">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground">
              Ready to take the engine for a spin?
            </h2>
            <p className="text-xl text-muted-foreground">
              Stop fighting the algorithm and start mastering your distribution. Join the next wave of Chiyu early adopters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-lg shadow-primary/25">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
