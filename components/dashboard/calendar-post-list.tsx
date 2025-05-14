"use client"

import Link from "next/link"
import { Clock, MoreHorizontal } from "lucide-react"

import { formatTime, getPlatformColor, truncateText } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  title: string
  content: string
  platform: string
  scheduledFor: string
}

interface CalendarPostListProps {
  date: Date
  posts: Post[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CalendarPostList({ date, posts, onEdit, onDelete }: CalendarPostListProps) {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <h3 className="mb-2 font-medium">{formattedDate}</h3>
        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">No posts scheduled for this day</p>
          <Link href="/dashboard/create" className="text-sm font-medium text-primary hover:underline">
            Create a post
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 font-medium">{formattedDate}</h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const colors = getPlatformColor(post.platform)
          const postDate = new Date(post.scheduledFor)

          return (
            <div key={post.id} className="flex items-start justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Link href={`/dashboard/post/${post.id}`} className="font-medium hover:underline">
                  {post.title}
                </Link>
                <p className="text-sm text-muted-foreground">{truncateText(post.content, 60)}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <div className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: colors.text }} />
                    <span className="text-xs capitalize">{post.platform}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{formatTime(postDate)}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(post.id)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(post.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
