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
import { CalendarIcon, Clock, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { createPost } from "@/lib/firebase/posts"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { PlatformDimensionsInfo } from "@/components/dashboard/platform-dimensions-info"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import type { SocialAccounts } from "@/types/social"

export default function CreatePostPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [platform, setPlatform] = useState("")
  const [contentType, setContentType] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("12:00")
  const [media, setMedia] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})
  const [loadingSocialAccounts, setLoadingSocialAccounts] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadSocialAccounts = async () => {
      setLoadingSocialAccounts(true)
      try {
        const accounts = await getSocialAccounts()
        setSocialAccounts(accounts)
      } catch (error) {
        console.error("Error loading social accounts:", error)
      } finally {
        setLoadingSocialAccounts(false)
      }
    }

    loadSocialAccounts()
  }, [])

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

    if (!media && contentType !== "text") {
      toast({
        variant: "destructive",
        title: "Media required",
        description: "Please upload media for your post.",
      })
      return
    }

    // Check if the platform is connected
    if (!socialAccounts[platform.toLowerCase() as keyof typeof socialAccounts]) {
      toast({
        variant: "destructive",
        title: "Account not connected",
        description: `Please connect your ${platform} account before scheduling posts.`,
        action: (
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/connections")}>
              Connect Account
            </Button>
          </div>
        ),
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const scheduledDateTime = new Date(date)
      const [hours, minutes] = time.split(":").map(Number)
      scheduledDateTime.setHours(hours, minutes)

      await createPost({
        title,
        description,
        platform,
        contentType,
        scheduledFor: scheduledDateTime,
        media: media,
      })

      toast({
        title: "Post scheduled!",
        description: `Your ${platform} post has been scheduled for ${format(scheduledDateTime, "PPP")} at ${time}.`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to schedule post",
        description: "There was an error scheduling your post. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-muted-foreground">Schedule a new post for your social media platforms</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Enter the details for your social media post</CardDescription>
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
                <Label>Upload Media</Label>
                <MediaUploader onFileSelected={setMedia} contentType={contentType} platform={platform} />
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
                  Scheduling...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Schedule Post
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
