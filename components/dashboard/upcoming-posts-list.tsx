import { formatDateTime } from "@/lib/utils"
import type { PostType } from "@/types/post"
import { getPlatformColor } from "@/lib/utils"
import { Instagram, Youtube, Video } from "lucide-react"

interface UpcomingPostsListProps {
  posts: PostType[]
}

export function UpcomingPostsList({ posts = [] }: UpcomingPostsListProps) {
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No upcoming posts scheduled</div>
  }

  // Sort posts by scheduled date
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.scheduledDate || 0).getTime()
    const dateB = new Date(b.scheduledDate || 0).getTime()
    return dateA - dateB
  })

  const getPlatformIcon = (platform: string) => {
    const platformColor = getPlatformColor(platform?.toLowerCase() || "")

    switch (platform?.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" style={{ color: platformColor.text }} />
      case "youtube":
        return <Youtube className="h-4 w-4" style={{ color: platformColor.text }} />
      case "tiktok":
        return <Video className="h-4 w-4" style={{ color: platformColor.text }} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <div key={post.id} className="flex items-start gap-3">
          <div
            className="mt-0.5 h-7 w-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getPlatformColor(post.platform?.toLowerCase() || "").bg }}
          >
            {getPlatformIcon(post.platform || "")}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{post.caption || "No caption"}</p>
            <p className="text-xs text-muted-foreground">
              {post.scheduledDate ? formatDateTime(post.scheduledDate) : "Date not set"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
