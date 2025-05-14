"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/dashboard/analytics-chart"
import { PlatformEngagementCard } from "@/components/dashboard/platform-engagement-card"
import { getAnalytics } from "@/lib/data-service"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        const data = await getAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your social media performance across platforms</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalPosts}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalEngagement}%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">{analytics.overview.scheduledPosts} posts ready to publish</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="impressions">Impressions</TabsTrigger>
        </TabsList>
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
              <CardDescription>Average engagement rate across platforms over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart data={analytics.engagement} />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            <PlatformEngagementCard platform="Instagram" stats={analytics.platforms.instagram} />
            <PlatformEngagementCard platform="YouTube" stats={analytics.platforms.youtube} />
            <PlatformEngagementCard platform="TikTok" stats={analytics.platforms.tiktok} />
          </div>
        </TabsContent>
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
              <CardDescription>Follower count across platforms over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart data={analytics.followers} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="impressions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impressions</CardTitle>
              <CardDescription>Total impressions across platforms over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart data={analytics.impressions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
