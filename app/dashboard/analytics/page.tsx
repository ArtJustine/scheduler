"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/dashboard/analytics-chart"
import { PlatformEngagementCard } from "@/components/dashboard/platform-engagement-card"
import { getAnalytics } from "@/lib/data-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useAuth } from "@/lib/auth-provider"

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  useEffect(() => {
    const loadAnalytics = async () => {
      // Don't fetch until auth is checked and user is available
      if (authLoading || !user) return

      try {
        setIsLoading(true)
        const data = await getAnalytics(timeframe)
        setAnalytics(data)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [timeframe, selectedPlatform, user, authLoading])

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

    const pData = analytics.platforms[selectedPlatform];
    return {
      totalPosts: Math.round(analytics.overview.totalPosts / 3), // Mock platform specific post count
      totalEngagement: pData.engagement,
      totalImpressions: pData.impressions,
      scheduledPosts: Math.round(analytics.overview.scheduledPosts / 3),
      // Spread platform specific real stats
      ...pData,
      youtubeViews: pData.views || analytics.overview.youtubeViews,
      youtubeLikes: pData.likes || analytics.overview.youtubeLikes,
      youtubeComments: pData.comments || analytics.overview.youtubeComments,
      publishedBlogPosts: analytics.overview.publishedBlogPosts,
    }
  }

  const overview = getOverview();
  const chartDataKey = selectedPlatform === "all" ? "value" : selectedPlatform;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your social media performance</p>
          </div>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[150px] h-9 text-xs font-semibold">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
          <TabsList className="flex bg-transparent border border-border h-9 items-center p-0.5 rounded-lg overflow-hidden">
            <TabsTrigger value="day" className="px-3 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Day</TabsTrigger>
            <TabsTrigger value="week" className="px-3 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Week</TabsTrigger>
            <TabsTrigger value="month" className="px-3 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Month</TabsTrigger>
            <TabsTrigger value="lifetime" className="px-3 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Lifetime</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedPlatform === "youtube" ? "YouTube Views" : selectedPlatform === "all" ? "Total Posts" : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Posts`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedPlatform === "youtube" ? overview.youtubeViews?.toLocaleString() : overview.totalPosts}
            </div>
            <p className="text-xs text-muted-foreground">+5% from last {timeframe}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedPlatform === "youtube" ? "YouTube Likes" : "Engagement Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedPlatform === "youtube" ? overview.youtubeLikes?.toLocaleString() : `${overview.totalEngagement}%`}
            </div>
            <p className="text-xs text-muted-foreground">+2% from last {timeframe}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedPlatform === "youtube" ? "YouTube Comments" : "Total Impressions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedPlatform === "youtube" ? overview.youtubeComments?.toLocaleString() : overview.totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last {timeframe}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.publishedBlogPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Live blog articles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="flex bg-transparent border border-border h-9 w-max items-center p-0.5 rounded-lg overflow-hidden">
          <TabsTrigger value="engagement" className="px-4 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Engagement</TabsTrigger>
          <TabsTrigger value="followers" className="px-4 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Followers</TabsTrigger>
          <TabsTrigger value="impressions" className="px-4 h-8 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Impressions</TabsTrigger>
        </TabsList>
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate ({selectedPlatform === "all" ? "All Platforms" : selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)})</CardTitle>
              <CardDescription>Performance trends over the selected {timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart data={analytics.engagement} dataKey={chartDataKey} color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"} />
            </CardContent>
          </Card>
          {selectedPlatform === "all" && (
            <div className="grid gap-4 md:grid-cols-3">
              <PlatformEngagementCard platform="Instagram" stats={analytics.platforms.instagram} />
              <PlatformEngagementCard platform="YouTube" stats={analytics.platforms.youtube} />
              <PlatformEngagementCard platform="TikTok" stats={analytics.platforms.tiktok} />
            </div>
          )}
          {selectedPlatform !== "all" && (
            <PlatformEngagementCard platform={selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} stats={analytics.platforms[selectedPlatform]} />
          )}
        </TabsContent>
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
              <CardDescription>Follower count across platforms over the selected {timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart data={analytics.followers} dataKey={chartDataKey} color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="impressions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impressions</CardTitle>
              <CardDescription>Total impressions across platforms over the selected {timeframe}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart data={analytics.impressions} dataKey={chartDataKey} color={selectedPlatform === "instagram" ? "#E1306C" : selectedPlatform === "youtube" ? "#FF0000" : selectedPlatform === "tiktok" ? "#69C9D0" : "#3b82f6"} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
