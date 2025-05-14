"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Instagram, Youtube, Video, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { PlatformDimensionsInfo } from "@/components/dashboard/platform-dimensions-info"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function CreatePostPage() {
  const [platform, setPlatform] = useState<string>("instagram")
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [media, setMedia] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!media) {
      toast({
        title: "Media Required",
        description: "Please upload media for your post.",
        variant: "destructive",
      })
      return
    }

    if (platform === "tiktok") {
      toast({
        title: "TikTok Disabled",
        description: "TikTok integration is currently disabled.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Post Created",
        description: date
          ? `Your post has been scheduled for ${format(date, "PPP")}`
          : "Your post has been created and will be published shortly.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your post.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <CardTitle>Platform</CardTitle>
            <CardDescription>Select the platform for your post</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={platform} onValueChange={setPlatform} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Label
                htmlFor="instagram"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="instagram" id="instagram" className="sr-only" />
                <Instagram className="mb-3 h-6 w-6" />
                Instagram
              </Label>
              <Label
                htmlFor="youtube"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="youtube" id="youtube" className="sr-only" />
                <Youtube className="mb-3 h-6 w-6" />
                YouTube
              </Label>
              <Label
                htmlFor="tiktok"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary relative"
              >
                <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Disabled
                </div>
                <RadioGroupItem value="tiktok" id="tiktok" className="sr-only" disabled />
                <Video className="mb-3 h-6 w-6" />
                TikTok
              </Label>
            </RadioGroup>

            {platform === "tiktok" && (
              <Alert className="mt-4" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>TikTok Integration Disabled</AlertTitle>
                <AlertDescription>
                  TikTok integration is currently unavailable. Please select another platform.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload media for your post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <MediaUploader onMediaSelected={(url) => setMedia(url)} selectedMedia={media} platform={platform} />
              <PlatformDimensionsInfo platform={platform} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Add content to your post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platform === "youtube" && (
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="content">
                {platform === "instagram" || platform === "tiktok" ? "Caption" : "Description"}
              </Label>
              <Textarea
                id="content"
                placeholder={`Enter ${
                  platform === "instagram" || platform === "tiktok" ? "a caption" : "a description"
                } for your post`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Choose when to publish your post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Publication Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                {date
                  ? "Your post will be published on the selected date."
                  : "If no date is selected, your post will be published immediately."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || platform === "tiktok"}>
              {isSubmitting ? "Creating..." : date ? "Schedule Post" : "Publish Now"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
