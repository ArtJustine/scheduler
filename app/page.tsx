import { Button } from "@/components/ui/button"
import { Calendar, Zap, ThumbsUp, Instagram, Youtube, Video, ArrowRight, Star, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-bold">Scheduler</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-pink-600/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Limited spots available</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              The truly{" "}
              <span className="relative inline-block">
                <span className="text-white">Limitless</span>
                <span className="text-gray-600"> social media</span>
              </span>
            </h1>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-600">
              scheduling tool
            </h2>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Say goodbye to manual posting, and hello to limitless, lightning-fast social media management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-900 text-lg px-8 py-6 h-auto">
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
              <div key={i} className="text-gray-400 text-lg font-semibold">
                Logo{i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-black to-gray-950">
        <div className="container px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-2xl md:text-3xl text-white leading-relaxed">
                "Scheduler has completely transformed how I manage my social media. The automation is seamless, and I've saved countless hours every week."
              </p>
              <div className="pt-4">
                <p className="text-lg font-semibold text-white">Sarah Johnson</p>
                <p className="text-gray-400">Content Creator, 500K+ Followers</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full py-20 md:py-32 bg-black">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                Your social media, <span className="italic text-gray-600">effortlessly</span>
              </h2>
              <p className="text-xl text-gray-400">
                Begin your scheduling journey in three effortless steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600/20 border border-purple-600/30 mx-auto">
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Schedule</h3>
                <p className="text-gray-400">
                  Connect your accounts & schedule as many posts as you'd like across all platforms.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600/20 border border-blue-600/30 mx-auto">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Automate</h3>
                <p className="text-gray-400">
                  Your posts are published automatically at the perfect time, even while you sleep.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600/20 border border-green-600/30 mx-auto">
                  <ThumbsUp className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Grow</h3>
                <p className="text-gray-400">
                  Track your performance and watch your engagement grow with consistent posting.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Link href="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto">
                  Start Scheduling Now
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
      <section className="w-full py-20 bg-black border-t border-gray-800">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to transform your social media?
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of creators who are saving time and growing their audience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-900 text-lg px-8 py-6 h-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-gray-800 bg-black">
        <div className="container px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Scheduler</span>
            </div>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            © 2025 Scheduler. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
