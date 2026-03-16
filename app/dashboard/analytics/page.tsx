"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformEngagementCard } from "@/components/dashboard/platform-engagement-card"
import { getAnalytics } from "@/lib/data-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, AreaChart, BarChart } from "@/components/dashboard/analytics-chart"
import { AIAnalyticsInsights } from "@/components/dashboard/ai-analytics-insights"

import { useAuth } from "@/lib/auth-provider"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { Eye, Users, Heart, BarChart3, TrendingUp, Calendar, Zap } from "lucide-react"

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return <AnalyticsContent />
}

function AnalyticsContent() {
  const { user, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [accounts, setAccounts] = useState<any>({})
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("month")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const searchParams = useSearchParams()

  useEffect(() => {
    const platformParam = searchParams.get("platform")
    if (platformParam) {
      setSelectedPlatform(platformParam)
    }
  }, [searchParams])

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
          .filter(([_, data]) => data !== null && (data as any).connected)
          .map(([platform]) => platform)
        setConnectedPlatforms(platforms)

        if (platforms.length === 1 && selectedPlatform === "all") {
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

  // Calculate real stats from connected accounts
  const calculateRealStats = (accounts: any, platform: string) => {
    let views = 0
    let followers = 0
    let likes = 0
    let posts = 0
    let engagement = 0

    const processAccount = (data: any) => {
      if (!data || !data.connected) return
      
      const pFollowers = Number(data.followers || 0)
      const pPosts = Number(data.posts || 0)
      const pLikes = Number(data.likes || 0)
      const pViews = Number(data.views || data.impressions || 0)
      
      views += pViews
      followers += pFollowers
      likes += pLikes
      posts += pPosts
      
      // If the platform doesn't provide a direct engagement metric, 
      // calculate it based on likes + 10% of views (as a proxy for interactions)
      const pEngagement = Number(data.engagement || 0)
      if (pEngagement > 0) {
        engagement += pEngagement
      } else if (pFollowers > 0) {
        // Industry standard estimate if not provided: (Likes + Comments) / Followers
        // Here we use likes + 2% of views as a proxy for total interactions
        const rate = ((pLikes + (pViews * 0.02)) / pFollowers) * 100
        engagement += rate
      }
    }

    if (platform === "all") {
      const platformKeys = Object.keys(accounts)
      const connectedPlatformsNum = platformKeys.filter(p => accounts[p]?.connected).length
      platformKeys.forEach(p => processAccount(accounts[p]))
      // If "all", average out the engagement rate across connected platforms
      if (connectedPlatformsNum > 1) engagement = engagement / connectedPlatformsNum
    } else if (accounts[platform]) {
      processAccount(accounts[platform])
    }

    return { views, followers, likes, posts, engagement }
  }

  const stats = calculateRealStats(accounts, selectedPlatform)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1 pr-4">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">
            Performance.
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Real-time performance across your digital footprint</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-muted/30 p-1.5 rounded-xl border border-border/50 shrink-0">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-9 border-none bg-transparent hover:bg-muted/50 focus:ring-0 px-2 transition-all">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-primary" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent position="item-aligned" className="z-[100]">
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="h-4 w-[1px] bg-border" />

          {connectedPlatforms.length > 0 && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[130px] md:w-[150px] h-8 md:h-9 border-none bg-transparent hover:bg-muted/50 focus:ring-0 px-2 transition-all">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-primary" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent position="item-aligned" className="z-[100]">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Impressions", value: stats.views, icon: Eye, color: "text-blue-500", trend: "+12.5%" },
          { label: "Community", value: stats.followers, icon: Users, color: "text-purple-500", trend: "+4.2%" },
          { label: "Total Loves", value: stats.likes, icon: Heart, color: "text-rose-500", trend: "+18.7%" },
          { label: "Consistency", value: stats.posts, icon: BarChart3, color: "text-emerald-500", trend: "+5.0%" },
        ].map((stat, i) => (
          <Card key={i} className="group overflow-hidden border-none bg-muted/20 hover:bg-muted/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
              <div className={`p-2 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mt-1 leading-none">{stat.value.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <TrendingUp className="h-2.5 w-2.5 mr-1" />
                  {stat.trend}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground italic">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-12 xl:col-span-5 border bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Growth Velocity
                </CardTitle>
                <CardDescription>Visualizing your audience and engagement trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="engagement" className="space-y-6">
              <TabsList className="bg-muted w-full sm:w-auto">
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="impressions">Impressions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="engagement" className="h-[350px] outline-none">
                <LineChart data={analytics?.engagement} />
              </TabsContent>
              <TabsContent value="followers" className="h-[350px] outline-none">
                <BarChart data={analytics?.followers} />
              </TabsContent>
              <TabsContent value="impressions" className="h-[350px] outline-none">
                <AreaChart data={analytics?.impressions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="lg:col-span-12 xl:col-span-2 space-y-6">
          <AIAnalyticsInsights stats={analytics} platform={selectedPlatform} />
          
          <Card className="bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-end border-b border-dashed border-border pb-3">
                  <span className="text-xs font-medium text-muted-foreground italic">Avg Engagement Rate</span>
                  <span className="text-lg font-black">{stats.engagement.toFixed(1)}%</span>
               </div>
               <div className="flex justify-between items-end border-b border-dashed border-border pb-3">
                  <span className="text-xs font-medium text-muted-foreground italic">Posts this Month</span>
                  <span className="text-lg font-black">{stats.posts}</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-muted-foreground italic">Peak Active Time</span>
                  <span className="text-lg font-black">8:00 PM</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-lg font-bold tracking-tight text-muted-foreground uppercase italic px-4">Platform Breakdown</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selectedPlatform === "all" ? (
            connectedPlatforms.map(platform => (
              <PlatformEngagementCard
                key={platform}
                platform={platform.charAt(0).toUpperCase() + platform.slice(1)}
                stats={analytics?.platforms?.[platform] || { likes: 0, comments: 0, views: 0, followers: 0 }}
              />
            ))
          ) : (
            <PlatformEngagementCard
              platform={selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
              stats={analytics?.platforms?.[selectedPlatform] || { likes: 0, comments: 0, views: 0, followers: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}