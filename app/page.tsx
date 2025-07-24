import { Button } from "@/components/ui/button"
import { Smartphone, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold">Chiyu</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Schedule Your Social Media Content
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Manage and schedule your YouTube, TikTok, and Instagram content from one place. Save time and
                    optimize your social media strategy.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-[300px] overflow-hidden rounded-xl border bg-background shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 opacity-20" />
                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">Chiyu</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs">Online</span>
                      </div>
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-pink-500" />
                            <span>Instagram Post</span>
                          </div>
                          <span className="text-xs">Today, 3:00 PM</span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-blue-500" />
                            <span>TikTok Video</span>
                          </div>
                          <span className="text-xs">Tomorrow, 10:00 AM</span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-red-500" />
                            <span>YouTube Video</span>
                          </div>
                          <span className="text-xs">May 15, 2:30 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to manage your social media presence
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Schedule Posts</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Plan and schedule your content across YouTube, TikTok, and Instagram.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Multi-Platform Support</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Optimize content dimensions for each platform automatically.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Analytics</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Track performance and engagement across all your social platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Chiyu. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
