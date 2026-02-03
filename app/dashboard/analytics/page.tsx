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
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !user) return

      try {
        setIsLoading(true)
        const [analyticsData, accounts] = await Promise.all([
          getAnalytics(timeframe),
          getSocialAccounts()
        ])

        setAnalytics(analyticsData)

        const platforms = Object.entries(accounts)
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

  // Calculate platform-specific overview if a platform is selected
  const getOverview = () => {
    if (selectedPlatform === "all") return analytics.overview;

    const pData = analytics.platforms[selectedPlatform] || {};
    return {
      totalPosts: pData.posts || 0,
      totalEngagement: pData.engagement || 0,
      totalImpressions: pData.impressions || 0,
      scheduledPosts: 0,
      views: pData.views || 0,
      subscribers: pData.followers || 0, // followers maps to subscribers for YT/TikTok
      likes: pData.likes || 0,
      ...pData
    }
  }

  const overview = getOverview();
  const chartDataKey = selectedPlatform === "all" ? "value" : selectedPlatform;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your social media performance across all platforms</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {connectedPlatforms.length > 1 && (
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

          <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
            <TabsList className="bg-muted/50 border border-border h-10 p-1 rounded-xl">
              <TabsTrigger value="day" className="px-4 h-8 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Day</TabsTrigger>
              <TabsTrigger value="week" className="px-4 h-8 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Week</TabsTrigger>
              <TabsTrigger value="month" className="px-4 h-8 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Month</TabsTrigger>
              <TabsTrigger value="lifetime" className="px-4 h-8 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Lifetime</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Views", value: overview.views || overview.totalImpressions, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Subscribers", value: overview.subscribers || overview.followers || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Total Likes", value: overview.likes || Math.round(overview.totalImpressions * 0.05), icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Engagement", value: `${overview.totalEngagement}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
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
              <div className="flex items-center mt-1 text-xs text-green-500 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12% from last {timeframe}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border h-11 p-1 rounded-xl w-max">
          <TabsTrigger value="engagement" className="px-6 h-9 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Engagement</TabsTrigger>
          <TabsTrigger value="followers" className="px-6 h-9 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Followers</TabsTrigger>
          <TabsTrigger value="impressions" className="px-6 h-9 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Impressions</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6 outline-none">
          <Card className="border-[0.5px] overflow-hidden">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Engagement Rate</CardTitle>
                  <CardDescription>Performance trends over the selected {timeframe}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                  <BarChart3 className="h-4 w-4" />
                  <span className="capitalize">{selectedPlatform === "all" ? "All Platforms" : selectedPlatform}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] pt-6">
              <LineChart
                data={analytics.engagement}
                dataKey={chartDataKey}
                color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selectedPlatform === "all" ? (
              connectedPlatforms.map(platform => (
                <PlatformEngagementCard
                  key={platform}
                  platform={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  stats={analytics.platforms[platform] || { likes: 0, comments: 0 }}
                />
              ))
            ) : (
              <PlatformEngagementCard
                platform={selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                stats={analytics.platforms[selectedPlatform] || { likes: 0, comments: 0 }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="followers" className="space-y-6 outline-none">
          <Card className="border-[0.5px] overflow-hidden">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle>Follower Growth</CardTitle>
              <CardDescription>Follower count across platforms over the selected {timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] pt-6">
              <BarChart
                data={analytics.followers}
                dataKey={chartDataKey}
                color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impressions" className="space-y-6 outline-none">
          <Card className="border-[0.5px] overflow-hidden">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle>Impressions</CardTitle>
              <CardDescription>Total impressions across platforms over the selected {timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] pt-6">
              <BarChart
                data={analytics.impressions}
                dataKey={chartDataKey}
                color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
