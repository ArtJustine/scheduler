import { Calendar, Zap, ThumbsUp, BarChart, Smartphone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FeaturesPage() {
    const features = [
        {
            icon: Calendar,
            title: "Smart Scheduling",
            description: "Plan your content calendar months in advance. Drag and drop posts to reschedule instantly.",
        },
        {
            icon: Zap,
            title: "Auto-Publishing",
            description: "Set it and forget it. We publish your content automatically at the best times for engagement.",
        },
        {
            icon: BarChart,
            title: "Advanced Analytics",
            description: "Deep dive into your performance metrics. Understand what resonates with your audience.",
        },
        {
            icon: Smartphone,
            title: "Mobile App",
            description: "Manage your social media on the go. Create, edit, and schedule posts from your phone.",
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Invite your team to collaborate. Assign roles, review drafts, and approve posts seamlessly.",
        },
        {
            icon: ThumbsUp,
            title: "Engagement Tools",
            description: "Respond to comments and messages from all platforms in one unified inbox.",
        },
        {
            icon: BarChart,
            title: "SEO Optimization",
            description: "Rank higher with built-in styling and hashtag recommendations tailored for maximum reach.",
        },
        {
            icon: Zap,
            title: "Human-like AI Generator",
            description: "Generate authentic, engaging captions and content ideas that sound exactly like you.",
        },
    ]

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/50 backdrop-blur-lg">
                <div className="container flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold font-heading tracking-tight">Chiyu</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>

                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Link href="/waitlist">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                                Join Waitlist
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-20 md:py-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
                    <div className="container px-6">
                        <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
                            <h1 className="text-4xl md:text-6xl font-bold font-heading">
                                All the tools you need to <span className="text-primary">grow</span>
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Everything you need to manage your social media presence effectively, all in one place.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <div key={i} className="p-8 rounded-2xl glass-card border border-border/50 hover:border-primary/50 transition-colors group">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold font-heading mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            ))}
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
