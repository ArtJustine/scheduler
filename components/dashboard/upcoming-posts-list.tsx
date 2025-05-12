import type { PostType } from "@/types/post"
import { format } from "date-fns"
import { Instagram, Youtube, Video } from "lucide-react"
import { getPlatformColor } from "@/lib/utils"

interface UpcomingPostsListProps {
  posts: PostType[]
}

export function UpcomingPostsList({ posts }: UpcomingPostsListProps) {
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
    return <div className="text-center py-6 text-muted-foreground">No upcoming posts. Create one now!</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const platformColor = getPlatformColor(post.platform)

        return (
          <div key={post.id} className="flex items-center gap-4">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: platformColor.bg }}
            >
              {getPlatformIcon(post.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{post.title}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{format(new Date(post.scheduledFor), "MMM d, h:mm a")}</span>
              </div>
            </div>
            <div
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: platformColor.bg,
                color: platformColor.text,
              }}
            >
              {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
