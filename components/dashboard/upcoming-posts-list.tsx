import Link from "next/link"
import { Calendar, Clock } from "lucide-react"

import { formatDate, formatTime, getPlatformColor } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Post {
  id: string
  title: string
  content: string
  platform: string
  scheduledFor: string
}

interface UpcomingPostsListProps {
  posts: Post[]
}

export function UpcomingPostsList({ posts }: UpcomingPostsListProps) {
  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
          <CardDescription>You have no upcoming posts scheduled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Create a Post
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Posts</CardTitle>
        <CardDescription>Your next {posts.length} scheduled posts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post, index) => {
            const colors = getPlatformColor(post.platform)
            const date = new Date(post.scheduledFor)

            return (
              <div key={post.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Link href={`/dashboard/post/${post.id}`} className="block font-medium hover:underline">
                      {post.title}
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: colors.text }} />
                      <span className="capitalize">{post.platform}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>{formatDate(date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{formatTime(date)}</span>
                    </div>
                  </div>
                </div>
                {index < posts.length - 1 && <Separator className="mt-4" />}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
