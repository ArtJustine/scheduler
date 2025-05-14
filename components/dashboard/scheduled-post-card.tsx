"use client"

import Link from "next/link"
import { Calendar, Clock, MoreHorizontal } from "lucide-react"

import { formatDate, formatTime, getPlatformColor, truncateText } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ScheduledPostCardProps {
  post: {
    id: string
    title: string
    content: string
    platform: string
    mediaUrl?: string
    scheduledFor: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ScheduledPostCard({ post, onEdit, onDelete }: ScheduledPostCardProps) {
  const colors = getPlatformColor(post.platform)
  const date = new Date(post.scheduledFor)

  return (
    <Card className="overflow-hidden">
      {post.mediaUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.mediaUrl || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div
            className="rounded-full px-2 py-1 text-xs font-medium capitalize"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {post.platform}
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
        <CardTitle className="line-clamp-1 text-base">{post.title}</CardTitle>
        <CardDescription className="line-clamp-2">{truncateText(post.content, 100)}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
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
      </CardContent>
      <CardFooter>
        <Link
          href={`/dashboard/post/${post.id}`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}
