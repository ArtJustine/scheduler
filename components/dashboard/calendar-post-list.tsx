import type { PostType } from "@/types/post"
import { format } from "date-fns"
import { Instagram, Youtube, Video, Edit } from "lucide-react"
import { getPlatformColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CalendarPostListProps {
  posts: PostType[]
}

export function CalendarPostList({ posts }: CalendarPostListProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "tiktok":
        return <Video className="h-4 w-4" />
      default:
        return null
    }
  }

  if (posts.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No posts scheduled for this date.</div>
  }

  // Sort posts by time
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => {
        const platformColor = getPlatformColor(post.platform)
        const postTime = format(new Date(post.scheduledFor), "h:mm a")

        return (
          <div key={post.id} className="flex flex-col space-y-2 p-3 border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: platformColor.bg }}
                >
                  {getPlatformIcon(post.platform)}
                </div>
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{postTime}</p>
                </div>
              </div>
              <div
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: platformColor.bg,
                  color: platformColor.text,
                }}
              >
                {post.contentType}
              </div>
            </div>

            {post.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.description}</p>}

            <div className="flex justify-end mt-2">
              <Link href={`/dashboard/post/${post.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
