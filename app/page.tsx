import { Button } from "@/components/ui/button"
import { Calendar, Zap, ThumbsUp, Instagram, Youtube, Video, ArrowRight, Star, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-heading tracking-tight">Chiyu</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>

            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>

          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/waitlist">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/25">
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Limited spots available</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight text-foreground">
              The truly{" "}
              <span className="relative inline-block">
                <span className="text-primary">Limitless</span>
                <span className="text-muted-foreground/60 block text-3xl md:text-5xl lg:text-6xl mt-2 font-normal">social media</span>
              </span>
            </h1>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight text-muted-foreground/40">
              scheduling tool
            </h2>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Say goodbye to manual posting, and hello to limitless, lightning-fast social media management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/waitlist">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl shadow-primary/20 transition-all hover:scale-105">
                  Join Waitlist
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white/10 text-foreground hover:bg-white/5 text-lg px-8 py-6 h-auto backdrop-blur-sm">
                  See Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured On Section */}
      <section className="w-full py-12 border-y border-gray-800">
        <div className="container px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by creators worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-muted-foreground/60 hover:text-primary transition-colors text-lg font-semibold cursor-default">
                Logo{i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-20 md:py-32 bg-muted/30">
        <div className="container px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-2xl md:text-3xl text-foreground leading-relaxed font-heading">
                "Chiyu has completely transformed how I manage my social media. The automation is seamless, and I've saved countless hours every week."
              </p>
              <div className="pt-4">
                <p className="text-lg font-semibold text-foreground">Sarah Johnson</p>
                <p className="text-muted-foreground">Content Creator, 500K+ Followers</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden glass-card border-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-primary/40 blur-3xl animate-pulse" />
                </div>
              </div>
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
              {/* Feature: SEO */}
              <div className="p-8 rounded-2xl glass-card border border-primary/20 hover:border-primary/50 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">SEO Optimization</h3>
                <p className="text-muted-foreground">
                  Rank higher with built-in styling and hashtag recommendations tailored for maximum reach.
                </p>
              </div>

              {/* Feature: AI */}
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
      <section className="w-full py-20 bg-gradient-to-b from-black to-gray-950">
        <div className="container px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Dashboard Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Calendar className="h-12 w-12 text-purple-400 mx-auto" />
                  <p className="text-sm text-gray-400">Dashboard View</p>
                </div>
              </div>
            </div>

            {/* Instagram Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Instagram className="h-12 w-12 text-pink-400 mx-auto" />
                  <p className="text-sm text-gray-400">Instagram Posts</p>
                </div>
              </div>
            </div>

            {/* YouTube Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Youtube className="h-12 w-12 text-red-400 mx-auto" />
                  <p className="text-sm text-gray-400">YouTube Videos</p>
                </div>
              </div>
            </div>

            {/* TikTok Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Video className="h-12 w-12 text-white mx-auto" />
                  <p className="text-sm text-gray-400">TikTok Videos</p>
                </div>
              </div>
            </div>

            {/* Analytics Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 border-2 border-green-400 rounded-lg mx-auto flex items-center justify-center">
                    <div className="h-6 w-6 border-t-2 border-green-400 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-gray-400">Analytics</p>
                </div>
              </div>
            </div>

            {/* Calendar Preview */}
            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 p-4">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Calendar className="h-12 w-12 text-blue-400 mx-auto" />
                  <p className="text-sm text-gray-400">Schedule Calendar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-background border-t border-border/50">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground">
              Ready to transform your social media?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators who are saving time and growing their audience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/waitlist">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-lg shadow-primary/25">
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-border/50 bg-background/50 backdrop-blur-lg">
        <div className="container px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Chiyu</span>
            </Link>
            <nav className="flex gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2025 Chiyu. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
