"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
    BarChart3,
    TrendingUp,
    Users,
    Eye,
    MessageSquare,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Share2,
    AlertCircle,
    Plus
} from "lucide-react"
import { LineChart, BarChart } from "@/components/dashboard/analytics-chart"

import { useAuth } from "@/lib/auth-provider"

interface PlatformPageProps {
    params: Promise<{ platform: string }>
}

export default function PlatformAnalyticsPage({ params }: PlatformPageProps) {
    const { user: authUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const resolvedParams = use(params)
    const platform = resolvedParams?.platform || ""
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        if (!platform || authLoading) return

        const checkConnection = async () => {
            if (!authUser) {
                setIsConnected(false)
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const { getSocialAccounts } = await import("@/lib/firebase/social-accounts")
                const accounts = await getSocialAccounts()
                const account = (accounts as any)[platform.toLowerCase()]

                if (account) {
                    setIsConnected(true)
                    setStats({
                        followers: account.followers || 1250,
                        engagement: account.engagement || 4.2,
                        impressions: account.impressions || 8400,
                        posts: account.posts || 24,
                        growth: [1200, 1210, 1225, 1240, 1245, 1250],
                        engagementData: [3.8, 4.0, 4.2, 3.9, 4.1, 4.2]
                    })
                } else {
                    setIsConnected(false)
                }
            } catch (error) {
                console.error("Error checking platform connection:", error)
                setIsConnected(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkConnection()
    }, [platform, authUser, authLoading])

    const handleConnect = () => {
        router.push("/dashboard/connections")
    }

    const getPlatformInfo = (pName: string) => {
        const p = pName.toLowerCase()
        switch (p) {
            case "facebook": return { name: "Facebook", icon: Facebook, color: "text-blue-600" }
            case "twitter": return { name: "Twitter", icon: Twitter, color: "text-sky-500" }
            case "instagram": return { name: "Instagram", icon: Instagram, color: "text-pink-600" }
            case "youtube": return { name: "YouTube", icon: Youtube, color: "text-red-600" }
            case "threads": return { name: "Threads", icon: MessageSquare, color: "text-zinc-900" }
            case "pinterest": return { name: "Pinterest", icon: Share2, color: "text-red-700" }
            case "tiktok": return { name: "TikTok", icon: Share2, color: "text-rose-600" }
            default: return { name: pName || "Platform", icon: Share2, color: "text-primary" }
        }
    }

    const info = getPlatformInfo(platform)

    if (isLoading || !platform) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-3">
                    <info.icon className={`h-8 w-8 ${info.color}`} />
                    <h1 className="text-3xl font-bold tracking-tight">{info.name}</h1>
                </div>

                <div className="relative overflow-hidden rounded-xl border bg-card p-12 text-center md:flex md:items-center md:text-left md:gap-12">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            All your {info.name.toLowerCase()} analytics
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            Track the daily evolution of your {info.name} page and the effect of your posts on its growth.
                            Get your audience's demographic data and review the stats related to the impact of each post.
                        </p>
                        <Button size="lg" className="h-14 px-8 text-lg rounded-xl" onClick={handleConnect}>
                            Connect a {info.name} page
                            <info.icon className="ml-3 h-5 w-5" />
                        </Button>
                    </div>

                    <div className="mt-12 md:mt-0 flex-shrink-0 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-xl border shadow-2xl p-4 w-full max-w-md rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            <div className="h-48 w-full bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center border-b mb-4">
                                <TrendingUp className="h-12 w-12 text-muted-foreground/30 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <info.icon className={`h-8 w-8 ${info.color}`} />
                    <h1 className="text-3xl font-bold tracking-tight">{info.name} Analytics</h1>
                </div>
                <Button variant="outline" size="sm" onClick={handleConnect}>
                    Manage Connection
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Followers
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.followers?.toLocaleString() ?? '0'}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Engagement Rate
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.engagement ?? '0'}%</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            2.4% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Impressions
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.impressions?.toLocaleString() ?? '0'}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            8% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Posts
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.posts ?? '0'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active schedule
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Follower Growth</CardTitle>
                        <CardDescription>Performance over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <LineChart
                            data={stats?.growth?.map((val: number, i: number) => ({
                                date: `Week ${i + 1}`,
                                value: val || 0
                            })) || []}
                            color={info.color.includes("text-") ? "currentColor" : undefined}
                        />
                    </CardContent>
                </Card>
                <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Engagement Details</CardTitle>
                        <CardDescription>Interaction metrics per period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <BarChart
                            data={stats?.engagementData?.map((val: number, i: number) => ({
                                date: `Week ${i + 1}`,
                                value: val || 0
                            })) || []}
                            color={info.color.includes("text-") ? "currentColor" : undefined}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
