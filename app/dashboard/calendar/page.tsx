"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getScheduledPosts } from "@/lib/firebase/posts"
import { CalendarPostList } from "@/components/dashboard/calendar-post-list"
import type { PostType } from "@/types/post"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { deletePost } from "@/lib/firebase/posts"
import { useToast } from "@/components/ui/use-toast"
import { cn, getPlatformColor } from "@/lib/utils"

export default function CalendarPage() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadPosts = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const fetchedPosts = await getScheduledPosts(user.uid)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadPosts()
    }
  }, [user, authLoading])

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      await deletePost(id)
      toast({
        title: "Post deleted",
        description: "Your post has been removed from the schedule.",
      })
      loadPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) return null

  const postsOnSelectedDate = selectedDate
    ? posts.filter((post) => {
      if (!post.scheduledFor || !post.platform) return false;
      const postDate = new Date(post.scheduledFor)
      if (isNaN(postDate.getTime()) || !selectedDate) return false;
      return (
        postDate.getDate() === selectedDate.getDate() &&
        postDate.getMonth() === selectedDate.getMonth() &&
        postDate.getFullYear() === selectedDate.getFullYear()
      )
    })
    : []

  // Function to get posts for a specific date (used for calendar day rendering)
  const getPostsForDate = (day: Date) => {
    if (!day || !posts) return []
    return posts.filter((post) => {
      if (!post.scheduledFor || !post.platform) return false;
      const postDate = new Date(post.scheduledFor)
      if (isNaN(postDate.getTime())) return false;
      return (
        postDate.getDate() === day.getDate() &&
        postDate.getMonth() === day.getMonth() &&
        postDate.getFullYear() === day.getFullYear()
      )
    })
  }

  // Custom day content rendering for the calendar to show indicators
  const CustomDayContent = ({ date: day }: { date: Date }) => {
    const postsOnDay = getPostsForDate(day)
    const isToday = format(new Date(), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")

    return (
      <div className="relative flex flex-col items-center justify-center w-full h-full pt-1">
        <span className={cn(
          "text-sm font-medium z-10",
          isToday && "text-primary font-bold"
        )}>
          {format(day, "d")}
        </span>
        {postsOnDay.length > 0 && (
          <div className="flex gap-0.5 mt-0.5 z-10 justify-center flex-wrap max-w-[80%]">
            {postsOnDay.slice(0, 4).map((post, i) => {
              const colors = getPlatformColor(post.platform)
              return (
                <div
                  key={post.id + i}
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: colors.text }}
                />
              )
            })}
            {postsOnDay.length > 4 && (
              <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">View and manage your scheduled posts in a calendar view</p>
        </div>
        <Button onClick={() => router.push("/dashboard/create")} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>{format(date, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setDate(newDate)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setDate(newDate)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={date}
                onMonthChange={setDate}
                className="rounded-md border-0"
                showOutsideDays={false}
                components={{
                  DayContent: CustomDayContent
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}</CardTitle>
            <CardDescription>
              {postsOnSelectedDate.length === 0
                ? "No posts scheduled for this date"
                : `${postsOnSelectedDate.length} post${postsOnSelectedDate.length === 1 ? "" : "s"} scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : postsOnSelectedDate.length > 0 ? (
              <CalendarPostList
                date={selectedDate || new Date()}
                posts={postsOnSelectedDate.map((post) => ({
                  ...post,
                  content: post.content || post.description || post.title || "",
                }))}
                onEdit={(id) => router.push(`/dashboard/post/${id}/edit`)}
                onDelete={handleDeletePost}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No posts scheduled for this date</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/dashboard/create")
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule a post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
