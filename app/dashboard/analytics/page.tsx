"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getScheduledPosts } from "@/lib/firebase/posts"
import type { PostType } from "@/types/post"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { PlatformEngagementCard } from "@/components/dashboard/platform-engagement-card"
import { BarChart3, TrendingUp, Users } from "lucide-react"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import type { SocialAccounts } from "@/types/social"
import { getTotalFollowers, getAverageEngagement, getTotalImpressions, generateChartData } from "@/lib/social-analytics"

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedPosts, fetchedAccounts] = await Promise.all([getScheduledPosts(), getSocialAccounts()])
        setPosts(fetchedPosts)
        setSocialAccounts(fetchedAccounts)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Mock data for analytics
  const analyticsData = {
    instagram: socialAccounts.instagram
      ? {
          followers: socialAccounts.instagram.followers || 0,
          engagement: socialAccounts.instagram.engagement || 0,
          impressions: socialAccounts.instagram.impressions || 0,
          reachGrowth: socialAccounts.instagram.followersGrowth || 0,
        }
      : {
          followers: 0,
          engagement: 0,
          impressions: 0,
          reachGrowth: 0,
        },
    tiktok: socialAccounts.tiktok
      ? {
          followers: socialAccounts.tiktok.followers || 0,
          engagement: socialAccounts.tiktok.engagement || 0,
          impressions: socialAccounts.tiktok.impressions || 0,
          reachGrowth: socialAccounts.tiktok.followersGrowth || 0,
        }
      : {
          followers: 0,
          engagement: 0,
          impressions: 0,
          reachGrowth: 0,
        },
    youtube: socialAccounts.youtube
      ? {
          followers: socialAccounts.youtube.followers || 0,
          engagement: socialAccounts.youtube.engagement || 0,
          impressions: socialAccounts.youtube.impressions || 0,
          reachGrowth: socialAccounts.youtube.followersGrowth || 0,
        }
      : {
          followers: 0,
          engagement: 0,
          impressions: 0,
          reachGrowth: 0,
        },
  }

  // Mock chart data
  const mockChartData = {
    instagram: [
      { date: "Jan", value: 400 },
      { date: "Feb", value: 600 },
      { date: "Mar", value: 500 },
      { date: "Apr", value: 700 },
      { date: "May", value: 900 },
      { date: "Jun", value: 1100 },
    ],
    tiktok: [
      { date: "Jan", value: 1000 },
      { date: "Feb", value: 1500 },
      { date: "Mar", value: 2000 },
      { date: "Apr", value: 3500 },
      { date: "May", value: 4200 },
      { date: "Jun", value: 5000 },
    ],
    youtube: [
      { date: "Jan", value: 200 },
      { date: "Feb", value: 300 },
      { date: "Mar", value: 250 },
      { date: "Apr", value: 400 },
      { date: "May", value: 500 },
      { date: "Jun", value: 600 },
    ],
  }

  // Generate chart data based on accounts
  const chartData = generateChartData(socialAccounts)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track performance across your social media platforms</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getTotalFollowers(socialAccounts).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{Math.floor(Math.random() * 10) + 5}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getAverageEngagement(socialAccounts).toFixed(1) + "%"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{(Math.random() * 3).toFixed(1)}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getTotalImpressions(socialAccounts).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{Math.floor(Math.random() * 10) + 10}%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Follower growth across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <AnalyticsChart
                  data={[
                    {
                      name: "Instagram",
                      data: mockChartData.instagram,
                      color: "#E1306C",
                    },
                    {
                      name: "TikTok",
                      data: mockChartData.tiktok,
                      color: "#000000",
                    },
                    {
                      name: "YouTube",
                      data: mockChartData.youtube,
                      color: "#FF0000",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <PlatformEngagementCard platform="Instagram" data={analyticsData.instagram} isLoading={isLoading} />
            <PlatformEngagementCard platform="TikTok" data={analyticsData.tiktok} isLoading={isLoading} />
            <PlatformEngagementCard platform="YouTube" data={analyticsData.youtube} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Performance</CardTitle>
              <CardDescription>Detailed analytics for your Instagram account</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <AnalyticsChart
                  data={[
                    {
                      name: "Followers",
                      data: mockChartData.instagram,
                      color: "#E1306C",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiktok" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TikTok Performance</CardTitle>
              <CardDescription>Detailed analytics for your TikTok account</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <AnalyticsChart
                  data={[
                    {
                      name: "Followers",
                      data: mockChartData.tiktok,
                      color: "#000000",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Performance</CardTitle>
              <CardDescription>Detailed analytics for your YouTube account</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <AnalyticsChart
                  data={[
                    {
                      name: "Followers",
                      data: mockChartData.youtube,
                      color: "#FF0000",
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
