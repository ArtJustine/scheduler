import { Button } from "@/components/ui/button"
import { Calendar, Zap, ThumbsUp, Instagram, Youtube, Video, ArrowRight, Star, CheckCircle2, QrCode, Globe, Clock, Layers, ShieldCheck, Mail } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <SiteHeader />

      {/* Hero Section - Premium Dark Background for both modes to support white headings */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Limited spots available</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight text-white">
              Scale your presence{" "}
              <span className="relative inline-block">
                <span className="text-primary">Limitless</span>
                <span className="text-white/90 block text-3xl md:text-5xl lg:text-6xl mt-2 font-normal">without scaling</span>
              </span>
            </h1>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight text-white/40">
              your workload.
            </h2>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Chiyu is the premium social engine designed for creators who value their time. Automate your growth across all platforms with surgical precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="border-white/10 text-foreground hover:bg-white/5 text-lg px-8 py-6 h-auto backdrop-blur-sm">
                  Explore Features
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

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {/* Step 1 */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mx-auto">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Schedule</h3>
                <p className="text-muted-foreground">
                  Connect your accounts & schedule as many posts as you'd like.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mx-auto">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Automate</h3>
                <p className="text-muted-foreground">
                  Your posts are published automatically at the perfect time.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-secondary/30">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mx-auto">
                  <ThumbsUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Grow</h3>
                <p className="text-muted-foreground">
                  Track your performance and watch your engagement grow.
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
