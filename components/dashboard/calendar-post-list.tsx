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
  mediaUrl?: string | null
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
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">{formattedDate}</h3>
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5">
          <p className="text-sm text-muted-foreground mb-4">No posts scheduled for this day</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/create">
              Create a post
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">{formattedDate}</h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const colors = getPlatformColor(post.platform)
          const postDate = new Date(post.scheduledFor)

          return (
            <div key={post.id} className="group relative flex flex-col gap-3 rounded-xl border border-muted/20 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {post.platform}
                    </div>
                    <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{formatTime(postDate)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/post/${post.id}`} className="block font-semibold text-sm hover:text-primary transition-colors truncate">
                    {post.title || "Untitled Post"}
                  </Link>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      className="cursor-pointer font-medium text-xs"
                      onClick={() => onEdit?.(post.id)}
                    >
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer font-medium text-xs text-destructive focus:text-destructive"
                      onClick={() => onDelete?.(post.id)}
                    >
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {truncateText(post.content || "", 120)}
              </p>

              {post.mediaUrl && (
                <div className="mt-1 rounded-lg overflow-hidden border border-muted/10 aspect-video bg-muted/5">
                  {post.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                      <Clock className="h-4 w-4 text-muted-foreground opacity-20" />
                    </div>
                  ) : (
                    <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
