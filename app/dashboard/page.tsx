"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { getScheduledPosts } from "@/lib/firebase/posts"
import { ScheduledPostCard } from "@/components/dashboard/scheduled-post-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { UpcomingPostsList } from "@/components/dashboard/upcoming-posts-list"
import type { PostType } from "@/types/post"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import type { SocialAccounts } from "@/types/social"

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlatformStats
              platform="Instagram"
              postCount={posts.filter((p) => p.platform === "instagram").length}
              followers={socialAccounts.instagram?.followers}
              connected={!!socialAccounts.instagram}
            />
            <PlatformStats
              platform="TikTok"
              postCount={posts.filter((p) => p.platform === "tiktok").length}
              followers={socialAccounts.tiktok?.followers}
              connected={!!socialAccounts.tiktok}
            />
            <PlatformStats
              platform="YouTube"
              postCount={posts.filter((p) => p.platform === "youtube").length}
              followers={socialAccounts.youtube?.followers}
              connected={!!socialAccounts.youtube}
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
                ) : posts.length > 0 ? (
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
            ) : posts.length > 0 ? (
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
