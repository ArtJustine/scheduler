"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/dashboard/analytics-chart"
import { PlatformEngagementCard } from "@/components/dashboard/platform-engagement-card"
import { getAnalytics } from "@/lib/data-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-provider"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { Eye, Users, Heart, Share2, TrendingUp, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [accounts, setAccounts] = useState<any>({})
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return

      try {
        setIsLoading(true)
        const [analyticsData, accountsData] = await Promise.all([
          getAnalytics(timeframe),
          getSocialAccounts()
        ])

        setAnalytics(analyticsData)
        setAccounts(accountsData)

        const platforms = Object.entries(accountsData)
          .filter(([_, data]) => data !== null)
          .map(([platform]) => platform)
        setConnectedPlatforms(platforms)

        if (platforms.length === 1) {
          setSelectedPlatform(platforms[0])
        }
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeframe, user, authLoading])

  if (authLoading || (isLoading && !analytics)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No Analytics Data Available</h2>
        <p className="text-muted-foreground">Start posting to see your analytics data.</p>
      </div>
    )
  }

  // Calculate real stats from connected accounts
  const calculateRealStats = (accounts: any, platform: string) => {
    let views = 0
    let followers = 0
    let likes = 0
    let posts = 0
    let engagement = 0

    // Helper to process one account
    const processAccount = (data: any) => {
      if (!data || !data.connected) return
      views += Number(data.views || 0)
      followers += Number(data.followers || 0)
      likes += Number(data.likes || 0)
      posts += Number(data.posts || 0)
      engagement += Number(data.engagement || 0)
    }

    if (platform === "all") {
      Object.values(accounts).forEach(processAccount)
    } else if (accounts[platform]) {
      processAccount(accounts[platform])
    }

    return { views, followers, likes, posts, engagement }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your social media performance across all platforms</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {connectedPlatforms.length > 0 && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[160px] h-10 bg-background border-border hover:bg-muted/50 transition-colors">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {connectedPlatforms.map(platform => (
                  <SelectItem key={platform} value={platform} className="capitalize">
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : connectedPlatforms.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h2 className="text-xl font-semibold mb-2">No connected accounts</h2>
          <p className="text-muted-foreground mb-4">Connect a social media account to view analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Views", value: calculateRealStats(accounts, selectedPlatform).views, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Subscribers", value: calculateRealStats(accounts, selectedPlatform).followers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Total Likes", value: calculateRealStats(accounts, selectedPlatform).likes, icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Total Posts", value: calculateRealStats(accounts, selectedPlatform).posts, icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
            ].map((stat, i) => (
              <Card key={i} className="border-[0.5px] hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground font-medium">
                    <span>From connected accounts</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Data</CardTitle>
                  <CardDescription>Historical data collection starts after you connect your accounts.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-t">
                  Not enough data to display charts yet.
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {selectedPlatform === "all" ? (
                  connectedPlatforms.map(platform => (
                    <PlatformEngagementCard
                      key={platform}
                      platform={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      stats={analytics[platform] || { likes: 0, comments: 0, views: 0, followers: 0 }}
                    />
                  ))
                ) : (
                  <PlatformEngagementCard
                    platform={selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                    stats={analytics[selectedPlatform] || { likes: 0, comments: 0, views: 0, followers: 0 }}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
