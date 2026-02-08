import { formatDistanceToNow } from "date-fns"
import { Calendar } from "lucide-react"
import Link from "next/link"

import type { PostType } from "@/types/post"

interface UpcomingPostsListProps {
  posts: PostType[]
}

export function UpcomingPostsList({ posts = [] }: UpcomingPostsListProps) {
  // Ensure posts is always an array
  const safePostsArray = Array.isArray(posts) ? posts : []

  if (safePostsArray.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No upcoming posts scheduled.</div>
  }

  return (
    <div className="space-y-4">
      {safePostsArray.map((post) => (
        <Link
          key={post.id}
          href={`/dashboard/post/${post.id}`}
          className="flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50"
        >
          <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="flex-1 space-y-1">
            <p className="font-medium leading-none">{post.content?.substring(0, 50) || "Untitled Post"}...</p>
            <p className="text-xs text-muted-foreground">
              {post.scheduledFor
                ? `Scheduled for ${formatDistanceToNow(new Date(post.scheduledFor), { addSuffix: true })}`
                : "Not scheduled"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium capitalize bg-primary/10 text-primary">
            {['instagram', 'youtube', 'facebook', 'x', 'linkedin', 'bluesky', 'threads', 'pinterest', 'tiktok'].includes((post.platform || "").toLowerCase()) && (
              ['x', 'tiktok', 'threads'].includes(post.platform?.toLowerCase() || "") ? (
                <div className="bg-white p-0.5 rounded-sm flex items-center justify-center">
                  <img
                    src={`/${post.platform?.toLowerCase()}.webp`}
                    alt={post.platform}
                    className="h-2.5 w-2.5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <img
                  src={`/${post.platform?.toLowerCase()}.webp`}
                  alt={post.platform}
                  className="h-3 w-3 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )
            )}
            {post.platform || "Multiple"}
          </div>
        </Link>
      ))}
    </div>
  )
}
