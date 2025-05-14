import { formatDistanceToNow } from "date-fns"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function UpcomingPostsList({ posts = [] }) {
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
          <div className="rounded-full px-2 py-1 text-xs font-medium capitalize bg-primary/10 text-primary">
            {post.platform || "Multiple"}
          </div>
        </Link>
      ))}
    </div>
  )
}
