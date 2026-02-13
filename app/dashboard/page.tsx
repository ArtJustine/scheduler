"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { AnalyticsView } from "@/components/dashboard/analytics-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Plus, Info, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getScheduledPosts, getSocialAccounts } from "@/lib/data-service"
import { getActiveWorkspace, createWorkspace } from "@/lib/firebase/workspaces"
import { ScheduledPostCard } from "@/components/dashboard/scheduled-post-card"
import { PlatformStats } from "@/components/dashboard/platform-stats"
import { UpcomingPostsList } from "@/components/dashboard/upcoming-posts-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
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
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const loadData = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const userId = user.uid || (user as any).id

      const workspace = await getActiveWorkspace(userId)
      setActiveWorkspace(workspace)

      if (workspace) {
        const [fetchedPosts, fetchedAccounts] = await Promise.all([
          getScheduledPosts(userId),
          getSocialAccounts(userId)
        ])

        setPosts(fetchedPosts || [])
        setSocialAccounts(fetchedAccounts || {})
      }
    } catch (error) {
      console.error("Dashboard: Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!user || !newWorkspaceName.trim()) return
    try {
      setIsLoading(true)
      await createWorkspace(user.uid, newWorkspaceName)
      setNewWorkspaceName("")
      await loadData()
      window.dispatchEvent(new CustomEvent('social-accounts-updated'))
    } catch (error) {
      console.error("Error creating workspace:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadData()
    }

    const handleRefresh = () => loadData()
    window.addEventListener('social-accounts-updated', handleRefresh)
    return () => window.removeEventListener('social-accounts-updated', handleRefresh)
  }, [user])

  const getPostCount = (platform: string) => {
    if (!posts || !Array.isArray(posts)) return 0
    return posts.filter((p) => {
      const pPlatform = p?.platform?.toLowerCase()
      const pPlatforms = p?.platforms?.map((plat: string) => plat.toLowerCase()) || []
      return pPlatform === platform.toLowerCase() || pPlatforms.includes(platform.toLowerCase())
    }).length
  }

  const getConnectedPlatformsList = () => {
    return Object.keys(socialAccounts).filter(
      (key) => socialAccounts[key as keyof SocialAccounts]?.connected
    )
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
          {!activeWorkspace ? (
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Building2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Create your first brand</h2>
                <p className="text-muted-foreground max-w-sm mb-8">
                  A workspace helps you organize social accounts and posts for different brands or projects.
                </p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    placeholder="Brand Name (e.g. My Cafe)"
                    value={newWorkspaceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateWorkspace()}
                  />
                  <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim() || isLoading}>
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : platformsToShow.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
                  <Info className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect a social account</h2>
                <p className="text-muted-foreground max-w-sm mb-8">
                  Your account overview will appear here once you connect your first social media platform to <strong>{activeWorkspace.name}</strong>.
                </p>
                <Button onClick={() => router.push("/dashboard/connections")}>
                  Go to Connections
                </Button>
              </CardContent>
            </Card>
          ) : (
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
          )}

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
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
