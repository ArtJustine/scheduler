"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPosts, getSocialAccounts } from "@/lib/data-service"
import { ScheduledPostCard } from "@/components/dashboard/scheduled-post-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { UpcomingPostsList } from "@/components/dashboard/upcoming-posts-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [socialAccounts, setSocialAccounts] = useState({})
  const router = useRouter()

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Use Promise.all to fetch data in parallel
      const [fetchedPosts, fetchedAccounts] = await Promise.all([getPosts(), getSocialAccounts()])

      setPosts(fetchedPosts || [])
      setSocialAccounts(fetchedAccounts || {})
    } catch (error) {
      console.error("Error loading data:", error)
      // Set default empty arrays/objects to prevent mapping errors
      setPosts([])
      setSocialAccounts({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Safely count posts by platform
  const getPostCount = (platform) => {
    if (!posts || !Array.isArray(posts)) return 0
    return posts.filter((p) => p?.platform?.toLowerCase() === platform.toLowerCase()).length
  }

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

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>You're viewing demo data. This is a UI prototype with mock data.</AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlatformStats
              platform="Instagram"
              postCount={getPostCount("instagram")}
              followers={socialAccounts?.instagram?.followers || 0}
              connected={!!socialAccounts?.instagram?.connected}
            />
            <PlatformStats
              platform="TikTok"
              postCount={getPostCount("tiktok")}
              followers={socialAccounts?.tiktok?.followers || 0}
              connected={!!socialAccounts?.tiktok?.connected}
            />
            <PlatformStats
              platform="YouTube"
              postCount={getPostCount("youtube")}
              followers={socialAccounts?.youtube?.followers || 0}
              connected={!!socialAccounts?.youtube?.connected}
            />
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
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>View performance metrics across your social platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Analytics data will appear here once you have published posts.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
