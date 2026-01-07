"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar, Clock, ArrowLeft, Pencil, Trash2, Info } from "lucide-react"
import { format } from "date-fns"
import { getPostById, deletePost } from "@/lib/data-service"
import type { PostType } from "@/types/post"

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [post, setPost] = useState<PostType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const postData = await getPostById(id)
        setPost(postData)
      } catch (error) {
        console.error("Error loading post:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [id])

  const handleDelete = async () => {
    if (!post) return

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsDeleting(true)
        await deletePost(post.id)
        router.push("/dashboard")
      } catch (error) {
        console.error("Error deleting post:", error)
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/post/${post.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>


      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={post.status === "published" ? "default" : "outline"}>
                    {post.status === "published" ? "Published" : "Scheduled"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {post.platform}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {post.status === "published" ? (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Published {post.publishedAt ? format(new Date(post.publishedAt), "PPP") : "N/A"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled for {post.scheduledFor ? format(new Date(post.scheduledFor), "PPP") : "N/A"}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video rounded-md overflow-hidden bg-muted">
            <img
              src={post.mediaUrl || "/placeholder.svg?height=400&width=600"}
              alt={post.title}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Content</h3>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          {post.status === "published" && post.analytics && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Likes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{post.analytics.likes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{post.analytics.comments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Shares</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{post.analytics.shares}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{post.analytics.impressions}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
