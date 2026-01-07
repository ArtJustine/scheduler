"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ImageIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { PlatformDimensionsInfo } from "@/components/dashboard/platform-dimensions-info"
import { createPost } from "@/lib/firebase/posts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreatePostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [platform, setPlatform] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title || !content || !platform || !mediaUrl) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Create the post in Firestore
      await createPost({
        title,
        description: content,
        platform,
        contentType: mediaUrl ? "media" : "text",
        mediaUrl,
        scheduledFor: scheduledDate ? scheduledDate.toISOString() : new Date().toISOString(),
        status: "scheduled",
      })

      // Redirect to the dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating post:", error)
      setError("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
        <p className="text-muted-foreground">Create and schedule a new social media post</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Enter the details for your social media post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Enter post content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="platform" className="text-sm font-medium">
                Platform
              </label>
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="scheduledDate" className="text-sm font-medium">
                Schedule Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload media for your post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platform && <PlatformDimensionsInfo platform={platform} />}

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Media</label>
              <MediaUploader onUpload={handleMediaUpload} />
            </div>

            {mediaUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-md overflow-hidden">
                  {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={mediaUrl}
                      alt="Media preview"
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </form>
    </div>
  )
}
