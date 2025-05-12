"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, Save, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { getPost, updatePost, deletePost } from "@/lib/firebase/posts"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { PlatformDimensionsInfo } from "@/components/dashboard/platform-dimensions-info"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { PostType } from "@/types/post"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<PostType | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [platform, setPlatform] = useState("")
  const [contentType, setContentType] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("12:00")
  const [media, setMedia] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const postId = params.id

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const fetchedPost = await getPost(postId)
        if (fetchedPost) {
          setPost(fetchedPost)
          setTitle(fetchedPost.title)
          setDescription(fetchedPost.description || "")
          setPlatform(fetchedPost.platform)
          setContentType(fetchedPost.contentType)

          const scheduledDate = new Date(fetchedPost.scheduledFor)
          setDate(scheduledDate)

          const hours = scheduledDate.getHours().toString().padStart(2, "0")
          const minutes = scheduledDate.getMinutes().toString().padStart(2, "0")
          setTime(`${hours}:${minutes}`)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post details.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !platform || !contentType || !date || !time) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const scheduledDateTime = new Date(date)
      const [hours, minutes] = time.split(":").map(Number)
      scheduledDateTime.setHours(hours, minutes)

      await updatePost(postId, {
        title,
        description,
        platform,
        contentType,
        scheduledFor: scheduledDateTime.toISOString(),
      })

      toast({
        title: "Post updated!",
        description: `Your ${platform} post has been updated.`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update post",
        description: "There was an error updating your post. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deletePost(postId)
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: "There was an error deleting your post. Please try again.",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground">Update your scheduled post</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Post
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Update the details for your social media post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="contentType">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      {platform === "instagram" && <SelectItem value="story">Story</SelectItem>}
                      {platform === "instagram" && <SelectItem value="reel">Reel</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description/Caption</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter post description or caption"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Schedule Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
              </div>

              {platform && contentType && <PlatformDimensionsInfo platform={platform} contentType={contentType} />}

              <div className="space-y-2">
                <Label>Media</Label>
                {post.mediaUrl ? (
                  <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-md">
                    <img
                      src={post.mediaUrl || "/placeholder.svg"}
                      alt="Post media"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <MediaUploader onFileSelected={setMedia} contentType={contentType} platform={platform} />
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
