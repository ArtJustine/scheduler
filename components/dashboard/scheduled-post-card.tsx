import { formatDistanceToNow } from "date-fns"
import { Calendar, MoreVertical } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type { PostType } from "@/types/post"

interface ScheduledPostCardProps {
  post: PostType
}

export function ScheduledPostCard({ post }: ScheduledPostCardProps) {
  if (!post) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {post.mediaUrl ? (
          <Image
            src={post.mediaUrl || "/placeholder.svg?height=400&width=400"}
            alt={post.content?.substring(0, 20) || "Post image"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold line-clamp-1">{post.content?.substring(0, 50) || "Untitled Post"}...</h3>
            <p className="text-sm text-muted-foreground">
              {post.scheduledFor
                ? `Scheduled for ${formatDistanceToNow(new Date(post.scheduledFor || Date.now()), {
                  addSuffix: true,
                })}`
                : "Not scheduled"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/post/${post.id}`}>Edit Post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Delete Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full justify-between">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(post.scheduledFor || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium capitalize bg-primary/10 text-primary">
            {['instagram', 'youtube', 'facebook', 'x', 'linkedin', 'bluesky', 'threads', 'pinterest', 'tiktok'].includes((post.platform || "").toLowerCase()) && (
              <div className="bg-white p-0.5 rounded-full flex items-center justify-center">
                <img
                  src={`/${post.platform?.toLowerCase()}.webp`}
                  alt={post.platform}
                  className="h-2.5 w-2.5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            {post.platform || "Multiple"}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
