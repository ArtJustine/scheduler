"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarIcon,
  ImageIcon,
  Plus,
  Video,
  Youtube,
  Smile,
  FileImage,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  Send,
  Info,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music2,
  X,
  ChevronDown,
  FileText,
  Hash,
  Image as ImageIconLucide,
  Upload
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { createPost } from "@/lib/firebase/posts"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { getCaptionTemplates, getHashtagGroups } from "@/lib/data-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/lib/auth-provider"
import type { CaptionTemplate } from "@/types/caption"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { HashtagGroup } from "@/types/hashtag"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { registerMediaMetadata, getMediaLibrary } from "@/lib/firebase/media"
import { firebaseStorage } from "@/lib/firebase-client"
import { ref, getDownloadURL, uploadString, uploadBytes } from "firebase/storage"
import type { MediaItem } from "@/types/media"

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
  const [youtubeAspectRatio, setYoutubeAspectRatio] = useState<"9:16" | "16:9" | "community">("16:9")
  const [templates, setTemplates] = useState<CaptionTemplate[]>([])
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // YouTube Specific Options
  const [youtubePlaylist, setYoutubePlaylist] = useState<string>("")
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState<boolean>(false)
  const [youtubeAgeRestriction, setYoutubeAgeRestriction] = useState<boolean>(false)
  const [youtubeAlteredContent, setYoutubeAlteredContent] = useState<boolean>(false)
  const [youtubeCategory, setYoutubeCategory] = useState<string>("22") // 22 is People & Blogs default
  const [youtubeTags, setYoutubeTags] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const timezoneOffset = (() => {
    try {
      const now = new Date()
      const offset = -now.getTimezoneOffset() / 60
      return `GMT${offset >= 0 ? "+" : ""}${offset}`
    } catch (e) {
      return "GMT+0"
    }
  })()

  useEffect(() => {
    async function loadPlatforms() {
      if (!user) return
      try {
        const [accounts, templateData, hashtagData, mediaData] = await Promise.allSettled([
          getSocialAccounts(user.uid),
          getCaptionTemplates(user.uid),
          getHashtagGroups(user.uid),
          getMediaLibrary(user.uid)
        ])

        const accountsResult = accounts.status === 'fulfilled' ? accounts.value : {}
        const templatesResult = templateData.status === 'fulfilled' ? templateData.value : []
        const hashtagResult = hashtagData.status === 'fulfilled' ? hashtagData.value : []
        const mediaResult = mediaData.status === 'fulfilled' ? mediaData.value : []

        const platforms = Object.entries(accountsResult)
          .filter(([_, data]) => data !== null)
          .map(([platform]) => platform)

        setConnectedPlatforms(platforms)
        setTemplates(templatesResult || [])
        setHashtagGroups(hashtagResult || [])
        setMediaItems(mediaResult || [])

        if (platforms.length > 0) {
          setSelectedPlatforms([platforms[0]])
          setPreviewPlatform(platforms[0])
        }
      } catch (err) {
        console.error("Error loading initial data:", err)
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
        if (newPlatforms.length === 0) return prev
        if (previewPlatform === platform && newPlatforms.length > 0) {
          setPreviewPlatform(newPlatforms[0])
        }
        return newPlatforms
      } else {
        return [...prev, platform]
      }
    })
  }

  const handleMediaUpload = (url: string) => {
    setMediaUrl(url)
  }

  const captureFrame = async () => {
    if (!videoRef.current || !user || !firebaseStorage) return
    setIsCapturing(true)
    try {
      const video = videoRef.current
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

      const timestamp = Date.now()
      const storageRef = ref(firebaseStorage, `thumbnails/${user.uid}/${timestamp}_frame.jpg`)
      await uploadString(storageRef, dataUrl, 'data_url')
      const downloadURL = await getDownloadURL(storageRef)

      setThumbnailUrl(downloadURL)

      await registerMediaMetadata({
        url: downloadURL,
        title: "Video Frame Thumbnail",
        type: "image",
        fileName: "frame.jpg",
        fileSize: Math.round(dataUrl.length * 0.75),
        storagePath: storageRef.fullPath,
      })
    } catch (error) {
      console.error("Error capturing frame:", error)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    if (!user || !firebaseStorage) return
    try {
      const timestamp = Date.now()
      const fileName = `thumb_${timestamp}_${file.name}`
      const storageRef = ref(firebaseStorage, `thumbnails/${user.uid}/${fileName}`)

      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      setThumbnailUrl(downloadURL)

      await registerMediaMetadata({
        url: downloadURL,
        title: `Thumbnail: ${file.name}`,
        type: "image",
        fileName: file.name,
        fileSize: file.size,
        storagePath: storageRef.fullPath,
      })
    } catch (error) {
      console.error("Error uploading thumbnail:", error)
    }
  }

  const getPlatformIcon = (plat: string, className?: string) => {
    switch (plat.toLowerCase()) {
      case "tiktok":
        return <Music2 className={cn("h-5 w-5", className)} />
      case "youtube":
        return <Youtube className={cn("h-5 w-5 text-red-600", className)} />
      case "instagram":
        return <Instagram className={cn("h-5 w-5 text-pink-600", className)} />
      case "facebook":
        return <Facebook className={cn("h-5 w-5 text-blue-600", className)} />
      case "linkedin":
        return <Linkedin className={cn("h-5 w-5 text-blue-700", className)} />
      case "twitter":
        return <Twitter className={cn("h-5 w-5 text-sky-500", className)} />
      default:
        return <Share2 className={cn("h-5 w-5", className)} />
    }
  }

  const getGuidelines = () => {
    const guidelines = []
    if (selectedPlatforms.includes("tiktok")) {
      guidelines.push({
        id: "tiktok",
        title: "TikTok Best Practices",
        content: "Keep videos between 15-60 seconds and use trending hashtags for better reach.",
        icon: <Music2 className="h-5 w-5" />,
        color: "bg-primary/10 text-primary"
      })
    }
    if (selectedPlatforms.includes("youtube")) {
      if (youtubeAspectRatio === "9:16") {
        guidelines.push({
          id: "youtube-shorts",
          title: "YouTube Shorts",
          content: "Ensure content is vertical (9:16) and under 60 seconds to be categorized as a Short.",
          icon: <Youtube className="h-5 w-5" />,
          color: "bg-red-50 text-red-600"
        })
      } else if (youtubeAspectRatio === "community") {
        guidelines.push({
          id: "youtube-community",
          title: "YouTube Community Post",
          content: "Use engaging text or images. Community posts are great for interacting with your audience without video.",
          icon: <Youtube className="h-5 w-5" />,
          color: "bg-red-100 text-red-600"
        })
      } else {
        guidelines.push({
          id: "youtube-long",
          title: "YouTube Long-form",
          content: "High-quality 16:9 4K videos perform best. Add a compelling thumbnail and description.",
          icon: <Youtube className="h-5 w-5" />,
          color: "bg-red-50 text-red-600"
        })
      }
    }
    return guidelines
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const postData = {
        title: content.substring(0, 50) || "New Post",
        description: content.substring(0, 100) || "Created from scheduler",
        content,
        platforms: selectedPlatforms,
        platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] : (selectedPlatforms.length > 1 ? "multiple" : "unknown"),
        contentType: mediaUrl ? (mediaUrl.match(/\.(mp4|mov|webm)$/i) ? "video" : "image") : "text",
        mediaUrl,
        thumbnailUrl,
        scheduledFor: (() => {
          try {
            if (!scheduledDate) return new Date().toISOString()
            const [hours, minutes] = (scheduledTime || "09:00").split(":").map(Number)
            if (isNaN(hours) || isNaN(minutes)) return new Date().toISOString()

            const d = new Date(scheduledDate)
            d.setHours(hours, minutes, 0, 0)
            return d.toISOString()
          } catch (e) {
            console.error("Error formatting date:", e)
            return new Date().toISOString()
          }
        })(),
        status: "scheduled" as const,
        aspectRatio: youtubeAspectRatio,
        youtubePostType: selectedPlatforms.includes("youtube") ? (youtubeAspectRatio === "community" ? "community" : (mediaUrl ? "video" : "community")) : undefined,
        youtubeOptions: selectedPlatforms.includes("youtube") ? {
          playlist: youtubePlaylist,
          madeForKids: youtubeMadeForKids,
          ageRestriction: youtubeAgeRestriction,
          alteredContent: youtubeAlteredContent,
          tags: youtubeTags.split(",").map(t => t.trim()).filter(t => t),
          category: youtubeCategory
        } : undefined,
        timezone
      }

      console.log("Submitting post data:", postData)
      await createPost(postData as any)
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/dashboard/calendar")
      }, 3000)
    } catch (err: any) {
      console.error("Error creating post:", err)
      setError(err.message || "Failed to create post")
    } finally {
      setIsSubmitting(false)
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
                    "rounded-full h-12 w-12 transition-all shadow-sm",
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
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 bg-primary text-white shadow-md hover:scale-105 transition-transform"
              title="Add platform"
              onClick={() => router.push("/dashboard/connections")}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Main Content Card */}
          <Card className="shadow-sm border-muted/20">
            <CardContent className="p-0">
              {/* Content Area */}
              <div className="relative">
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] border border-muted/30 rounded-xl resize-none text-base focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 px-6 py-6 bg-transparent"
                />

                {/* Character count */}
                <div className="absolute bottom-4 right-6 text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
                  {content.length} / 500
                </div>
              </div>

              {/* Media Preview */}
              {mediaUrl && (
                <div className="px-6 pb-6">
                  <div className="border rounded-xl overflow-hidden relative group bg-black/5">
                    {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={mediaUrl}
                        alt="Media preview"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    ) : (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          src={mediaUrl}
                          controls
                          className="w-full h-auto max-h-[400px] object-contain mx-auto"
                        />
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[10px] h-8 gap-2 shadow-lg bg-white/95"
                            onClick={captureFrame}
                            disabled={isCapturing}
                          >
                            <ImageIconLucide className="h-3.5 w-3.5" />
                            {isCapturing ? "Capturing..." : "Set Frame as Thumbnail"}
                          </Button>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                      onClick={() => {
                        setMediaUrl("")
                        setThumbnailUrl("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Thumbnail Section */}
                  {(thumbnailUrl || (mediaUrl && !mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i))) && (
                    <div className="mt-6 p-4 border rounded-xl bg-muted/20 border-muted/30">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-3 block">Video Thumbnail</label>
                      <div className="flex items-start gap-4">
                        <div className="relative w-40 aspect-video border rounded-lg bg-black/5 overflow-hidden shadow-inner">
                          {thumbnailUrl ? (
                            <>
                              <img src={thumbnailUrl} className="w-full h-full object-cover" />
                              <button
                                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                                onClick={() => setThumbnailUrl("")}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                              <ImageIconLucide className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <Button variant="outline" size="sm" className="h-9 text-xs relative overflow-hidden bg-background shadow-sm border-muted/30 hover:bg-muted/10">
                            <Plus className="mr-2 h-4 w-4" />
                            Custom Thumbnail
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleThumbnailUpload(file)
                              }}
                            />
                          </Button>
                          {!mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Upload a custom image or use the <span className="font-semibold">"Set Frame"</span> tool on the video preview.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-3">
                  {/* Media Button - More Prominent */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 px-4 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-primary"
                      >
                        <FileImage className="h-4 w-4" />
                        <span className="text-xs font-semibold">Add Media</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px] p-2" onCloseAutoFocus={(e) => e.preventDefault()}>
                      <DropdownMenuItem
                        className="text-xs py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-md px-3"
                        onClick={() => setShowMediaUploader(true)}
                      >
                        <Upload className="mr-2.5 h-3.5 w-3.5" />
                        <span>Upload New</span>
                      </DropdownMenuItem>
                      {mediaItems.length > 0 && (
                        <DropdownMenuItem
                          className="text-xs py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-md px-3"
                          onClick={() => setShowMediaLibrary(true)}
                        >
                          <ImageIcon className="mr-2.5 h-3.5 w-3.5" />
                          <span>From Library ({mediaItems.length})</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/5" title="Add emoji">
                    <Smile className="h-5 w-5" />
                  </Button>

                  {(templates.length > 0 || hashtagGroups.length > 0) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 px-4 h-10 text-primary hover:text-primary hover:bg-primary/5 transition-colors border-transparent hover:border-primary/20 bg-background/50">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-semibold">Content Library</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[260px] p-2" onCloseAutoFocus={(e) => e.preventDefault()}>
                        {templates.length > 0 && (
                          <>
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 py-2">Descriptions</DropdownMenuLabel>
                            {templates.map((template) => (
                              <DropdownMenuItem
                                key={template.id}
                                className="text-xs py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-md px-3"
                                onClick={() => setContent(prev => prev + (prev ? "\n\n" : "") + template.content)}
                              >
                                <FileText className="mr-2.5 h-3.5 w-3.5" />
                                <span className="truncate">{template.title}</span>
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}

                        {hashtagGroups.length > 0 && (
                          <>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 py-2">Hashtag Groups</DropdownMenuLabel>
                            {hashtagGroups.map((group) => (
                              <DropdownMenuItem
                                key={group.id}
                                className="text-xs py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-md px-3"
                                onClick={() => setContent(prev => prev + (prev ? "\n" : "") + group.hashtags.map(h => `#${h}`).join(" "))}
                              >
                                <Hash className="mr-2.5 h-3.5 w-3.5" />
                                <span className="truncate">{group.name}</span>
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* YouTube Aspect Ratio Selection */}
                {selectedPlatforms.includes("youtube") && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Format:</span>
                    <Select
                      value={youtubeAspectRatio}
                      onValueChange={(val: "9:16" | "16:9") => setYoutubeAspectRatio(val)}
                    >
                      <SelectTrigger className="h-9 w-[130px] text-[10px] bg-background border-muted/30 shadow-sm font-medium">
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16" className="text-[10px] py-2">Shorts (9:16)</SelectItem>
                        <SelectItem value="16:9" className="text-[10px] py-2">Video (16:9)</SelectItem>
                        <SelectItem value="community" className="text-[10px] py-2">Community Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media Uploader Section */}
          <Collapsible open={showMediaUploader} onOpenChange={setShowMediaUploader}>
            <CollapsibleContent className="space-y-4">
              <Card className="shadow-sm border-dashed">
                <CardContent className="p-6">
                  <MediaUploader onUpload={handleMediaUpload} />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Media Library Dialog */}
          <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select from Media Library</DialogTitle>
                <DialogDescription>
                  Choose an existing media file from your library
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                {mediaItems.length > 0 ? (
                  mediaItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMediaUrl(item.url)
                        if (item.thumbnailUrl) {
                          setThumbnailUrl(item.thumbnailUrl)
                        }
                        setShowMediaLibrary(false)
                        // If it's a video, we might want to reset aspect ratio if needed, 
                        // but let's keep it simple for now.
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full bg-muted">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title || "Video"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <Video className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || "Media"}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white font-medium truncate">{item.title || "Untitled"}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                    <p className="text-sm text-muted-foreground">No media in your library yet</p>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => {
                        setShowMediaLibrary(false)
                        setShowMediaUploader(true)
                      }}
                    >
                      Upload your first media
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <AlertTitle className="text-green-900 font-bold">Post Scheduled Successfully!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your post has been added to the calendar. Redirecting to calendar...
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Platform Selection */}
          <div className="flex flex-wrap gap-4 mb-8">
            {connectedPlatforms.map((platform) => (
              <div key={platform} className="relative group">
                <Button
                  variant={isPlatformSelected(platform) ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "rounded-full h-12 w-12 transition-all shadow-sm",
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
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 bg-primary text-white shadow-md hover:scale-105 transition-transform"
              title="Add platform"
              onClick={() => router.push("/dashboard/connections")}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Scheduling Section */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Schedule Post
                </h3>
                <div className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {timezoneOffset} ({timezone})
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-destructive">Post at</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">Times follow your local location ({timezone})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Specific Options */}
          {selectedPlatforms.includes("youtube") && (
            <Card className="shadow-sm border-l-4 border-l-red-600">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-sm">YouTube Settings</h3>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={youtubeCategory} onValueChange={setYoutubeCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="22">People & Blogs</SelectItem>
                        <SelectItem value="10">Music</SelectItem>
                        <SelectItem value="23">Comedy</SelectItem>
                        <SelectItem value="24">Entertainment</SelectItem>
                        <SelectItem value="20">Gaming</SelectItem>
                        <SelectItem value="1">Film & Animation</SelectItem>
                        <SelectItem value="2">Autos & Vehicles</SelectItem>
                        <SelectItem value="15">Pets & Animals</SelectItem>
                        <SelectItem value="17">Sports</SelectItem>
                        <SelectItem value="19">Travel & Events</SelectItem>
                        <SelectItem value="25">News & Politics</SelectItem>
                        <SelectItem value="26">Howto & Style</SelectItem>
                        <SelectItem value="27">Education</SelectItem>
                        <SelectItem value="28">Science & Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Playlist</Label>
                    <Input
                      placeholder="Enter playlist name or ID"
                      value={youtubePlaylist}
                      onChange={(e) => setYoutubePlaylist(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tags (comma separated)</Label>
                    <Input
                      placeholder="vlog, tutorial, funny"
                      value={youtubeTags}
                      onChange={(e) => setYoutubeTags(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                      <Label htmlFor="kids" className="text-xs font-medium cursor-pointer">Made for Kids</Label>
                      <Switch
                        id="kids"
                        checked={youtubeMadeForKids}
                        onCheckedChange={setYoutubeMadeForKids}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                      <Label htmlFor="age" className="text-xs font-medium cursor-pointer">Age Restriction</Label>
                      <Switch
                        id="age"
                        checked={youtubeAgeRestriction}
                        onCheckedChange={setYoutubeAgeRestriction}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-3 col-span-full">
                      <Label htmlFor="altered" className="text-xs font-medium cursor-pointer flex flex-col gap-1">
                        <span>Altered Content</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Content is AI-generated or synthetically altered.</span>
                      </Label>
                      <Switch
                        id="altered"
                        checked={youtubeAlteredContent}
                        onCheckedChange={setYoutubeAlteredContent}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Guidelines Section */}
          <Collapsible className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="default" className="w-full h-12 justify-between px-6 bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm">
                <span className="font-semibold tracking-tight">Guidelines</span>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 px-1">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {getGuidelines().length > 0 ? (
                    getGuidelines().map((guide) => (
                      <div key={guide.id} className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg", guide.color)}>
                          {guide.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{guide.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{guide.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">Select a platform to see guidelines.</p>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Preview</h2>
            <Tabs value={previewView} onValueChange={setPreviewView} className="w-auto">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="mobile" className="gap-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-xs">Mobile</span>
                </TabsTrigger>
                <TabsTrigger value="desktop" className="gap-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Monitor className="h-4 w-4" />
                  <span className="text-xs">Desktop</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={previewPlatform} onValueChange={setPreviewPlatform} className="w-full">
            <TabsContent value="tiktok" className="mt-0">
              <div className={cn(
                "relative mx-auto border-[8px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-300",
                previewView === "mobile" ? "w-[320px] h-[640px]" : "w-full h-[500px] border-none rounded-xl"
              )}>
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {mediaUrl && !mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <>
                      <video src={mediaUrl} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform">
                          {getPlatformIcon(previewPlatform, "h-12 w-12 text-white/70")}
                        </div>
                      </div>
                    </>
                  ) : mediaUrl ? (
                    <img src={mediaUrl} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="bg-gray-800/50 p-6 rounded-full border border-white/5">
                        {getPlatformIcon(previewPlatform, "h-16 w-16 text-gray-700")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile UI Overlay */}
                {previewView === "mobile" && (
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white pb-12">
                    <div className="space-y-2 mb-4">
                      <p className="font-bold">@youraccount</p>
                      <p className="text-sm line-clamp-3">{content || "What's on your mind?"}</p>
                    </div>
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md"><Heart className="h-6 w-6" /></div>
                        <span className="text-xs">0</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md"><MessageCircle className="h-6 w-6" /></div>
                        <span className="text-xs">0</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md"><Share2 className="h-6 w-6" /></div>
                        <span className="text-xs">0</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="youtube" className="mt-0">
              <div className={cn(
                "mx-auto border rounded-xl overflow-hidden shadow-lg bg-card",
                previewView === "mobile" ? "w-[320px]" : "w-full"
              )}>
                <div className={cn(
                  "bg-black relative",
                  youtubeAspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
                )}>
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} className="w-full h-full object-cover" />
                  ) : mediaUrl ? (
                    mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ?
                      <img src={mediaUrl} className="w-full h-full object-contain" /> :
                      <video src={mediaUrl} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getPlatformIcon("youtube", "h-12 w-12 text-red-600 opacity-20")}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/10 backdrop-blur-sm p-4 rounded-full">
                      <Youtube className="h-12 w-12 text-white/50" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-100 rounded w-24"></div>
                      <div className="h-2 bg-gray-50 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full h-14 text-lg font-bold shadow-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !content || selectedPlatforms.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Scheduling...
              </>
            ) : (
              <>
                <div className="flex -space-x-2 mr-2">
                  {selectedPlatforms.slice(0, 3).map((plat) => (
                    <div key={plat} className="p-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                      {getPlatformIcon(plat, "h-4 w-4 text-white")}
                    </div>
                  ))}
                </div>
                Schedule Post
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium ml-2">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
