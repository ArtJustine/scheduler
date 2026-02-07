"use client"

import Link from "next/link"
import { Clock, MoreHorizontal, Send } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, ExternalLink, Play, AlertCircle } from "lucide-react"

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
          const isPast = postDate < new Date()
          const displayStatus = (post.status === "scheduled" && isPast) ? "posted" : (post.status || "scheduled")

          return (
            <div key={post.id} className="group relative flex flex-col gap-4 rounded-3xl border border-muted/20 bg-card p-5 shadow-sm transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 pr-2 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {post.platform}
                    </div>
                    <div className="flex items-center text-[10px] text-muted-foreground font-bold whitespace-nowrap bg-muted/30 px-2 py-1 rounded-full">
                      <Clock className="mr-1.5 h-3 w-3" />
                      <span>{formatTime(postDate)}</span>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title || "Untitled Post"}
                  </h4>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-[0.15em] whitespace-nowrap shadow-sm",
                    displayStatus === "published" || displayStatus === "posted" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      displayStatus === "failed" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                  )}>
                    {displayStatus}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted transition-all active:scale-90 absolute top-4 right-4 z-10">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-xl border-white/20 rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                      <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-3 py-2">Post Options</DropdownMenuLabel>

                      <div className="space-y-0.5">
                        {post.status !== "published" && (
                          <DropdownMenuItem
                            className="cursor-pointer font-bold text-xs py-2 rounded-xl px-3 flex items-center gap-2.5 hover:bg-primary/5 focus:bg-primary/5 transition-all group/item"
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
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                              <Send className="h-3.5 w-3.5" />
                            </div>
                            Publish Now
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="cursor-pointer font-bold text-xs py-2 rounded-xl px-3 flex items-center gap-2.5 hover:bg-primary/5 focus:bg-primary/5 transition-all group/item"
                          onClick={() => onEdit?.(post.id)}
                        >
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                          </div>
                          Edit Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-muted/10 mx-1.5 my-1.5" />

                        <DropdownMenuItem
                          className="cursor-pointer font-bold text-xs text-rose-500 py-2 rounded-xl px-3 flex items-center gap-2.5 hover:bg-rose-500/5 focus:bg-rose-500/5 transition-all group/item focus:text-rose-500"
                          onClick={() => onDelete?.(post.id)}
                        >
                          <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover/item:bg-rose-500 group-hover/item:text-white transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </div>
                          Discard Post
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1.5 font-medium">
                {truncateText(post.content || "", 150)}
              </p>

              {post.status === "failed" && post.error && (
                <div className="text-[10px] font-bold text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-100 flex items-start gap-2 animate-in slide-in-from-top-1 shadow-sm">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{post.error}</span>
                </div>
              )}

              {post.mediaUrl && (
                <div className="rounded-[1.8rem] overflow-hidden border border-muted/20 aspect-video bg-slate-50 dark:bg-slate-900/50 relative group/media shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)]">
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
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-all duration-500 scale-75 group-hover/media:scale-100 shadow-2xl">
                        <Play className="h-6 w-6 text-white fill-white ml-0.5" />
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
