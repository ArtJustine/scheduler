"use client"

import { useEffect, useState } from "react"
import AnalyticsPage from "./analytics/page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { getScheduledPosts, getSocialAccounts } from "@/lib/data-service"
import { ScheduledPostCard } from "@/components/dashboard/scheduled-post-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { UpcomingPostsList } from "@/components/dashboard/upcoming-posts-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { PostType } from "@/types/post"
import type { SocialAccounts } from "@/types/social"

export default function DashboardPage() {
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

  return <DashboardContent />
}

function DashboardContent() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})
  const router = useRouter()

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [fetchedPosts, fetchedAccounts] = await Promise.all([getScheduledPosts(), getSocialAccounts()])

      setPosts(fetchedPosts || [])
      setSocialAccounts(fetchedAccounts || {})
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleRefresh = () => loadData()
    window.addEventListener('social-accounts-updated', handleRefresh)
    return () => window.removeEventListener('social-accounts-updated', handleRefresh)
  }, [])

  const getPostCount = (platform: string) => {
    if (!posts || !Array.isArray(posts)) return 0
    return posts.filter((p) => p?.platform?.toLowerCase() === platform.toLowerCase()).length
  }

  const getConnectedPlatformsList = () => {
    const connected = Object.keys(socialAccounts).filter(
      (key) => socialAccounts[key as keyof SocialAccounts]?.connected
    )
    return connected.length > 0 ? connected : ["tiktok", "youtube"]
  }

  const platformsToShow = getConnectedPlatformsList()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your scheduled posts and view analytics</p>
        </div>
        <Button onClick={() => router.push("/dashboard/create")} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border/50 h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200 px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200 px-4 py-2"
          >
            Scheduled
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-all duration-200 px-4 py-2"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformsToShow.map((platformKey) => {
              const account = socialAccounts[platformKey as keyof SocialAccounts]
              return (
                <PlatformStats
                  key={platformKey}
                  platform={platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}
                  postCount={getPostCount(platformKey)}
                  followers={account?.followers}
                  posts={account?.posts}
                  connected={!!account?.connected}
                  username={account?.username}
                  profileImage={account?.profileImage}
                />
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Posts
                </CardTitle>
                <CardDescription>Your next scheduled content</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : posts && posts.length > 0 ? (
                  <UpcomingPostsList posts={posts.slice(0, 5)} />
                ) : (
                  <div className="text-center py-6 text-muted-foreground">No upcoming posts. Create one now!</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent post activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No recent activity to display.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-[200px] flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </Card>
                ))
            ) : posts && posts.length > 0 ? (
              posts.map((post) => <ScheduledPostCard key={post.id} post={post} />)
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p className="mb-4">No scheduled posts found</p>
                <Button onClick={() => router.push("/dashboard/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first post
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}

