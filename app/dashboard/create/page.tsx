"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ImageIcon, Plus, Video, Youtube, Smile, FileImage, Smartphone, Monitor, Heart, MessageCircle, Share2, Repeat2, Send, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { createPost } from "@/lib/firebase/posts"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [mediaUrl, setMediaUrl] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date())
  const [scheduledTime, setScheduledTime] = useState<string>("09:02")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [previewPlatform, setPreviewPlatform] = useState<string>("tiktok")
  const [previewView, setPreviewView] = useState<string>("mobile")
  const [youtubeAspectRatio, setYoutubeAspectRatio] = useState<"9:16" | "16:9">("16:9")

  useEffect(() => {
    async function loadPlatforms() {
      if (!user) return
      try {
        const accounts = await getSocialAccounts()
        const platforms = Object.entries(accounts)
          .filter(([_, data]) => data !== null)
          .map(([platform]) => platform)

        setConnectedPlatforms(platforms)
        if (platforms.length > 0) {
          setSelectedPlatforms([platforms[0]])
          setPreviewPlatform(platforms[0])
        }
      } catch (err) {
        console.error("Error loading platforms:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPlatforms()
  }, [user])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        const newPlatforms = prev.filter(p => p !== platform)
        // Ensure at least one platform is selected
        if (newPlatforms.length === 0) return prev
        // Update preview platform if current one was removed
        if (previewPlatform === platform && newPlatforms.length > 0) {
          setPreviewPlatform(newPlatforms[0])
        }
        return newPlatforms
      } else {
        return [...prev, platform]
      }
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)

    if (!content || selectedPlatforms.length === 0) {
      setError("Please add content and select at least one platform")
      return
    }

    try {
      setIsSubmitting(true)

      // Combine date and time
      const scheduledDateTime = scheduledDate ? new Date(scheduledDate) : new Date()
      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(":")
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
      }

      // Create posts for each selected platform
      for (const platform of selectedPlatforms) {
        await createPost({
          title: content.substring(0, 50), // Use first 50 chars as title
          description: content,
          platform,
          contentType: mediaUrl ? "media" : "text",
          mediaUrl,
          scheduledFor: scheduledDateTime.toISOString(),
          status: "scheduled",
          aspectRatio: platform === "youtube" ? youtubeAspectRatio : undefined,
        })
      }

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

  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case "tiktok":
        return <Video className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      default:
        return null
    }
  }

  const isPlatformSelected = (platform: string) => selectedPlatforms.includes(platform)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Create new post</h1>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="flex items-center gap-2">
            {connectedPlatforms.map((platform) => (
              <div key={platform} className="relative">
                <Button
                  variant={isPlatformSelected(platform) ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "rounded-full h-12 w-12 transition-all",
                    isPlatformSelected(platform) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => togglePlatform(platform)}
                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                >
                  {getPlatformIcon(platform)}
                </Button>
                {isPlatformSelected(platform) && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              title="Add platform"
              onClick={() => router.push("/dashboard/connections")}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content Card */}
          <Card>
            <CardContent className="p-0">
              {/* Content Area */}
              <div className="relative">
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] border-0 resize-none text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                {/* Character count */}
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                  {content.length} / 500
                </div>
              </div>

              {/* Media Preview */}
              {mediaUrl && (
                <div className="px-4 pb-4">
                  <div className="border rounded-md overflow-hidden relative">
                    {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={mediaUrl}
                        alt="Media preview"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setMediaUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Media Uploader */}
              {showMediaUploader && (
                <div className="px-4 pb-4">
                  <MediaUploader onUpload={handleMediaUpload} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMediaUploader(!showMediaUploader)}
                    title="Add media"
                  >
                    <FileImage className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Add emoji">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>

                {/* YouTube Aspect Ratio Selection */}
                {selectedPlatforms.includes("youtube") && (
                  <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={youtubeAspectRatio === "9:16" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] px-2"
                      onClick={() => setYoutubeAspectRatio("9:16")}
                    >
                      Shorts (9:16)
                    </Button>
                    <Button
                      variant={youtubeAspectRatio === "16:9" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] px-2"
                      onClick={() => setYoutubeAspectRatio("16:9")}
                    >
                      Video (16:9)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines Section - Dynamically updates based on selected platforms */}
          <Card className="border-[0.5px]">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Guidelines</span>
                  {selectedPlatforms.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')})
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-2 pb-3 space-y-4">
                  {/* General Guidelines */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Content Guidelines</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Keep your content engaging and authentic</li>
                      <li>Use relevant hashtags to increase visibility</li>
                      <li>Post consistently to grow your audience</li>
                      <li>Engage with comments and build community</li>
                      <li>Optimize posting times for your audience</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Use high-quality images and videos</li>
                      <li>Write compelling captions that tell a story</li>
                      <li>Include a clear call-to-action</li>
                      <li>Stay on-brand with your messaging</li>
                    </ul>
                  </div>

                  {/* Platform-specific guidelines */}
                  {selectedPlatforms.includes("tiktok") && (
                    <>
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <h4 className="text-sm font-semibold">TikTok Guidelines</h4>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Optimal video length: 15-60 seconds</li>
                          <li>Use trending sounds and hashtags</li>
                          <li>Hook viewers in the first 3 seconds</li>
                          <li>Add captions for accessibility</li>
                          <li>Post 1-4 times per day for best engagement</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">TikTok Video Requirements</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Aspect ratio: 9:16 (vertical)</li>
                          <li>Resolution: 1080x1920 minimum</li>
                          <li>Format: MP4 or MOV</li>
                          <li>Max file size: 287.6 MB</li>
                        </ul>
                      </div>
                    </>
                  )}

                  {selectedPlatforms.includes("youtube") && (
                    <>
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          <h4 className="text-sm font-semibold">YouTube Guidelines</h4>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Create attention-grabbing titles (max 100 chars)</li>
                          <li>Use custom thumbnails for better CTR</li>
                          <li>Add video chapters for longer content</li>
                          <li>Optimize description with keywords</li>
                          <li>Include end screens and cards</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">YouTube Video Requirements</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Aspect ratio: 16:9 for regular videos</li>
                          <li>Resolution: 1080p or higher recommended</li>
                          <li>Format: MP4, MOV, AVI, FLV, WMV</li>
                          <li>Max file size: 256 GB</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              {/* Date Time Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "MMM dd, yyyy") : "Select date"} {scheduledTime}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <label className="text-sm font-medium mb-2 block">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </PopoverContent>
              </Popover>

              {/* Schedule Button */}
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !content}
              >
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </Button>
            </div>
          </div>
        </div>
        {/* End Left Column */}

        {/* Right Column - Preview Section */}
        <div className="hidden lg:block space-y-4">
          <div className="sticky top-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              {selectedPlatforms.length > 0 && (
                <div className="flex items-center gap-2">
                  {selectedPlatforms.map((platform) => (
                    <div key={platform} className="relative">
                      <Button
                        variant={previewPlatform === platform ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewPlatform(platform)}
                        className={cn(
                          "text-xs transition-all",
                          previewPlatform === platform && "ring-2 ring-primary/20"
                        )}
                      >
                        {getPlatformIcon(platform)}
                        <span className="ml-1 capitalize">{platform}</span>
                      </Button>
                      {previewPlatform === platform && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Tabs */}
            <Tabs defaultValue="mobile" value={previewView} onValueChange={setPreviewView} className="w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex items-center gap-2 p-0.5">
                  <button
                    onClick={() => setPreviewView("mobile")}
                    className={cn(
                      "relative inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all border",
                      previewView === "mobile"
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                    Mobile
                    {previewView === "mobile" && (
                      <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-[2px] w-12 bg-primary rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setPreviewView("desktop")}
                    className={cn(
                      "relative inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all border",
                      previewView === "desktop"
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    <Monitor className="h-3.5 w-3.5 mr-1.5" />
                    Desktop
                    {previewView === "desktop" && (
                      <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-[2px] w-12 bg-primary rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Preview */}
              <TabsContent value="mobile" className="mt-0">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Mobile Device Frame */}
                    <div className="bg-muted/30 p-4">
                      <div className="bg-background border-4 border-muted rounded-[2rem] shadow-xl mx-auto max-w-[280px] overflow-hidden">
                        {/* Status Bar */}
                        <div className="bg-background px-4 py-2 flex items-center justify-between text-xs border-b">
                          <span>9:41</span>
                          <span className="text-[10px] font-medium capitalize">
                            {selectedPlatforms.length > 1 ? previewPlatform : selectedPlatforms[0]}
                          </span>
                          <div className="flex gap-1 items-center">
                            <div className="text-xs">●●●●</div>
                          </div>
                        </div>

                        {/* Post Preview */}
                        <div className="bg-background">
                          {/* User Header */}
                          <div className="px-3 py-2 flex items-center gap-2 border-b">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-medium">You</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold">Your Account</p>
                              <p className="text-[10px] text-muted-foreground">Just now</p>
                            </div>
                          </div>

                          {/* Media Preview */}
                          {mediaUrl ? (
                            <div className={cn(
                              "bg-muted flex items-center justify-center overflow-hidden transition-all duration-300",
                              (previewPlatform === "youtube" && youtubeAspectRatio === "16:9") ? "aspect-video" : "aspect-[9/16]"
                            )}>
                              {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={mediaUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={mediaUrl}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ) : (
                            <div className={cn(
                              "bg-muted flex items-center justify-center transition-all duration-300",
                              (previewPlatform === "youtube" && youtubeAspectRatio === "16:9") ? "aspect-video" : "aspect-[9/16]"
                            )}>
                              <div className="text-center text-muted-foreground">
                                <FileImage className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">No media</p>
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          {content && (
                            <div className="px-3 py-2 border-t">
                              <p className="text-xs line-clamp-3">{content}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="px-3 py-2 flex items-center justify-between border-t">
                            <div className="flex items-center gap-4">
                              <Heart className="h-4 w-4 text-foreground/70" />
                              <MessageCircle className="h-4 w-4 text-foreground/70" />
                              <Share2 className="h-4 w-4 text-foreground/70" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Alert */}
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Previews are an approximation of how your post will look when published. The final post may look slightly different.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Desktop Preview */}
              <TabsContent value="desktop" className="mt-0">
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Desktop Browser Frame */}
                    <div className="border rounded-lg overflow-hidden shadow-lg">
                      {/* Browser Bar */}
                      <div className="bg-muted px-3 py-2 flex items-center gap-2 border-b">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="text-[10px] text-muted-foreground">
                            {selectedPlatforms.length > 1 ? previewPlatform : selectedPlatforms[0]}.com
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="bg-background">
                        {/* User Header */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium">You</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Your Account</p>
                            <p className="text-xs text-muted-foreground">Just now</p>
                          </div>
                        </div>

                        {/* Media Preview */}
                        {mediaUrl ? (
                          <div className={cn(
                            "bg-muted flex items-center justify-center overflow-hidden transition-all duration-300",
                            (previewPlatform === "youtube" && youtubeAspectRatio === "9:16") ? "aspect-[9/16] max-h-[500px]" : "aspect-video"
                          )}>
                            {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={mediaUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "bg-muted flex items-center justify-center transition-all duration-300",
                            (previewPlatform === "youtube" && youtubeAspectRatio === "9:16") ? "aspect-[9/16] max-h-[500px]" : "aspect-video"
                          )}>
                            <div className="text-center text-muted-foreground">
                              <FileImage className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">No media uploaded</p>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        {content && (
                          <div className="px-4 py-3 border-t">
                            <p className="text-sm">{content}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="px-4 py-3 flex items-center gap-6 border-t">
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Heart className="h-5 w-5" />
                            <span>Like</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <MessageCircle className="h-5 w-5" />
                            <span>Comment</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Share2 className="h-5 w-5" />
                            <span>Share</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Alert */}
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Previews are an approximation of how your post will look when published. The final post may look slightly different.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* End Right Column */}
      </div>
    </div>
  )
}
