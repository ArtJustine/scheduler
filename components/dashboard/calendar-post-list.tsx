"use client"

import Link from "next/link"
import { Clock, MoreHorizontal, Send, Edit2, Trash2, Play, AlertCircle } from "lucide-react"

import { cn, formatTime, getPlatformColor, truncateText } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  title: string
  content: string
  platform: string
  scheduledFor: string
  mediaUrl?: string | null
  thumbnailUrl?: string | null
  status?: "scheduled" | "published" | "failed" | "publishing"
  error?: string | null
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
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">{formattedDate}</h3>
        <div className="flex h-48 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-muted/20 bg-muted/5 p-8 transition-colors hover:bg-muted/10">
          <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-4">Nothing scheduled for today</p>
          <Button variant="outline" size="sm" asChild className="rounded-full px-6">
            <Link href="/dashboard/create">Create a post</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">{formattedDate}</h3>
      <div className="grid gap-4">
        {posts.map((post) => {
          const colors = getPlatformColor(post.platform)
          const postDate = new Date(post.scheduledFor)
          const isPast = postDate < new Date()
          const displayStatus = (post.status === "scheduled" && isPast) ? "posted" : (post.status || "scheduled")

          return (
            <div
              key={post.id}
              className="group relative flex flex-col gap-4 rounded-[2.5rem] border border-white/10 bg-card p-6 shadow-sm transition-all hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {post.platform}
                    </div>
                    <div className="flex items-center text-[10px] text-muted-foreground font-bold whitespace-nowrap bg-muted/30 px-3 py-1 rounded-full border border-white/5">
                      <Clock className="mr-1.5 h-3 w-3" />
                      <span>{formatTime(postDate)}</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title || "Untitled Post"}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm border transition-colors",
                    displayStatus === "published" || displayStatus === "posted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      displayStatus === "failed" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  )}>
                    {displayStatus}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/20 transition-all active:scale-90 bg-muted/5 border border-white/5">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] p-2 shadow-2xl border-white/10 rounded-3xl bg-white/80 dark:bg-black/80 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
                      <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/40 px-3 py-2">Post Options</DropdownMenuLabel>

                      <div className="space-y-1">
                        {post.status !== "published" && (
                          <DropdownMenuItem
                            className="cursor-pointer font-bold text-xs py-3 rounded-2xl px-4 flex items-center gap-3 focus:bg-primary/10 transition-all group/item"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/posts/${post.id}/publish`, { method: "POST" })
                                const data = await res.json()
                                if (data.success) {
                                  alert(data.message)
                                  window.location.reload()
                                } else {
                                  alert(data.error || "Failed to publish")
                                }
                              } catch (e) {
                                alert("An error occurred while publishing")
                              }
                            }}
                          >
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors shadow-sm">
                              <Send className="h-4 w-4" />
                            </div>
                            <span>Publish Now</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="cursor-pointer font-bold text-xs py-3 rounded-2xl px-4 flex items-center gap-3 focus:bg-primary/10 transition-all group/item"
                          onClick={() => onEdit?.(post.id)}
                        >
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors shadow-sm">
                            <Edit2 className="h-4 w-4" />
                          </div>
                          <span>Edit Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-muted/10 mx-3 my-1" />

                        <DropdownMenuItem
                          className="cursor-pointer font-bold text-xs text-rose-500 py-3 rounded-2xl px-4 flex items-center gap-3 focus:bg-rose-500/10 transition-all group/item focus:text-rose-500"
                          onClick={() => onDelete?.(post.id)}
                        >
                          <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover/item:bg-rose-500 group-hover/item:text-white transition-colors shadow-sm">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          <span>Discard Post</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                {truncateText(post.content || "", 150)}
              </p>

              {post.status === "failed" && post.error && (
                <div className="text-[10px] font-bold text-rose-600 bg-rose-500/5 p-4 rounded-[1.5rem] border border-rose-500/10 flex items-start gap-2 shadow-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{post.error}</span>
                </div>
              )}

              {post.mediaUrl && (
                <div className="rounded-[1.8rem] overflow-hidden border border-white/5 aspect-video bg-muted/20 relative group/media shadow-inner bg-slate-100 dark:bg-slate-900">
                  {post.thumbnailUrl ? (
                    <img src={post.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover/media:scale-105 duration-700" alt="Post thumbnail" />
                  ) : (() => {
                    const baseUrl = post.mediaUrl.split('?')[0];
                    const isVideo = baseUrl.match(/\.(mp4|mov|webm|avi|wmv)$/i);

                    if (isVideo) {
                      return (
                        <video
                          src={post.mediaUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          onMouseOver={(e) => e.currentTarget.play()}
                          onMouseOut={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                          muted
                          loop
                        />
                      )
                    }

                    return (
                      <img
                        src={post.mediaUrl}
                        className="w-full h-full object-cover transition-transform group-hover/media:scale-105 duration-700"
                        alt="Post media"
                        onError={(e) => {
                          const video = document.createElement('video');
                          video.src = post.mediaUrl || "";
                          video.className = "w-full h-full object-cover";
                          video.muted = true;
                          video.onloadedmetadata = () => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '';
                              parent.appendChild(video);
                            }
                          };
                        }}
                      />
                    )
                  })()}
                  <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-all duration-300 pointer-events-none flex items-center justify-center">
                    {post.mediaUrl.split('?')[0].match(/\.(mp4|mov|webm|avi|wmv)$/i) && (
                      <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-all duration-500 scale-75 group-hover/media:scale-100 shadow-2xl">
                        <Play className="h-8 w-8 text-white fill-white ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
