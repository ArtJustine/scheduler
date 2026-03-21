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
  Upload,
  User,
  Scissors
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MediaUploader } from "@/components/dashboard/media-uploader"
import { ImageCropper } from "@/components/dashboard/image-cropper"
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
import { Progress } from "@/components/ui/progress"
import { registerMediaMetadata, getMediaLibrary } from "@/lib/firebase/media"
import { firebaseStorage } from "@/lib/firebase-client"
import { ref, getDownloadURL, uploadString, uploadBytes, uploadBytesResumable } from "firebase/storage"
import type { MediaItem } from "@/types/media"
import { useToast } from "@/hooks/use-toast"

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    return now
  })
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    return format(now, "HH:mm")
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0)
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
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false)
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
  const { toast } = useToast()
  const [cropOpen, setCropOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<{ url: string; file: File } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Instagram Specific Options
  const [instagramPostType, setInstagramPostType] = useState<"post" | "reel" | "story">("post")

  // TikTok Specific Options
  const [tiktokPrivacy, setTiktokPrivacy] = useState<"public" | "friends" | "self">("public")
  const [tiktokAllowComments, setTiktokAllowComments] = useState(true)
  const [tiktokAllowDuet, setTiktokAllowDuet] = useState(true)
  const [tiktokAllowStitch, setTiktokAllowStitch] = useState(true)

  // Threads Specific Options
  const [threadsReplyPolicy, setThreadsReplyPolicy] = useState<"everyone" | "followed" | "mentioned">("everyone")

  // LinkedIn Specific Options
  const [linkedinVisibility, setLinkedinVisibility] = useState<"PUBLIC" | "CONNECTIONS">("PUBLIC")

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
  const handleEditImage = async () => {
    if (mediaUrls.length === 0) return
    setImageToCrop({ url: mediaUrls[0], file: new File([], "edited-image.jpg") })
    setCropOpen(true)
  }

  const handleMediaUpload = (media: { url: string; type: "image" | "video" }[]) => {
    if (media.length === 0) return

    const newUrls = media.map(m => m.url)
    const type = media[0].type

    setMediaUrls(prev => {
      // If switching types (image -> video or vice versa), replace
      if (mediaType && mediaType !== type) {
        return newUrls
      }
      // If it's a video, replace (only one video allowed)
      if (type === "video") {
        return [newUrls[0]]
      }
      // If it's images, append to existing images
      return [...prev, ...newUrls]
    })
    
    setMediaType(type)

    // Auto-detect post type based on media
    const isVideo = type === "video"
    if (isVideo) {
      if (selectedPlatforms.includes("instagram")) setInstagramPostType("reel")
      if (selectedPlatforms.includes("youtube") && youtubeAspectRatio === "9:16") setYoutubeAspectRatio("9:16")
    } else {
      if (selectedPlatforms.includes("instagram")) setInstagramPostType("post")
    }
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      console.log("No files selected in handleFileChange")
      return
    }

    console.log(`Selected ${files.length} files for manual upload`)

    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload media.",
          variant: "destructive",
        })
        return
      }

      const firstFile = files[0]
      const isVideo = firstFile.type.startsWith("video/")
      const isImage = firstFile.type.startsWith("image/")

      if (!isVideo && !isImage) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or video file",
          variant: "destructive",
        })
        return
      }

      // Mirroring MediaUploader logic
      const filesToUpload = isVideo ? [firstFile] : Array.from(files).filter(f => f.type.startsWith("image/"))
      if (filesToUpload.length === 0) return

      const maxSize = 100 * 1024 * 1024 // 100MB
      const validFiles = filesToUpload.filter(f => f.size <= maxSize)
      
      if (validFiles.length !== filesToUpload.length) {
        toast({
          title: "File(s) too large",
          description: "Some files are larger than 100MB and will be skipped.",
          variant: "destructive",
        })
      }

      if (validFiles.length === 0) return

      if (!firebaseStorage) {
        toast({
          title: "Upload Error",
          description: "Storage service is not available.",
          variant: "destructive",
        })
        return
      }

      // If single image, allow cropping
      if (validFiles.length === 1 && validFiles[0].type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setImageToCrop({ url: reader.result as string, file: validFiles[0] })
          setCropOpen(true)
        }
        reader.readAsDataURL(validFiles[0])
      } else {
        // Multiple images or a video - upload directly
        for (const file of validFiles) {
          await executeUpload(file, file.name)
        }
      }
    } catch (err: any) {
      console.error("Manual upload process error:", err)
      toast({
        title: "Upload Error",
        description: err.message || "An unexpected error occurred during upload.",
        variant: "destructive"
      })
    } finally {
      if (e.target) e.target.value = ""
    }
  }

  const handleManualCropComplete = async (croppedBlob: Blob) => {
    setCropOpen(false)
    if (imageToCrop) {
      await executeUpload(croppedBlob, imageToCrop.file.name)
    }
    setImageToCrop(null)
  }

  const executeUpload = async (file: File | Blob, originalName: string) => {
    try {
      setIsUploadingMedia(true)
      setMediaUploadProgress(0)

      toast({
        title: "Starting Upload",
        description: `Uploading ${originalName}...`,
      })

      if (!firebaseStorage || !user) return

      const timestamp = Date.now()
      const fileName = `${timestamp}_${originalName}`
      const storageRef = ref(firebaseStorage, `media/${user.uid}/${fileName}`)

      console.log("Starting upload to:", storageRef.fullPath)
      const uploadTask = uploadBytesResumable(storageRef, file)

      // Use a Promise to track completion more reliably
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setMediaUploadProgress(progress)
            console.log(`Manual upload progress: ${Math.round(progress)}%`)
          },
          (error) => {
            console.error("Upload failed in task.on:", error)
            reject(error)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              const type = originalName.toLowerCase().match(/\.(mp4|mov|avi|webm)$/) ? "video" : "image"

              await registerMediaMetadata({
                url: downloadURL,
                title: originalName,
                type: type,
                fileName: originalName,
                fileSize: file.size,
                storagePath: storageRef.fullPath,
              })

              handleMediaUpload([{ url: downloadURL, type }])
              toast({
                title: "Upload Complete",
                description: `${originalName} is ready.`,
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        )
      })
    } catch (err: any) {
      console.error("Upload execution error:", err)
      toast({
        title: "Upload Error",
        description: err.message || "An error occurred during upload.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingMedia(false)
      setMediaUploadProgress(0)
    }
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
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload thumbnails.",
        variant: "destructive",
      })
      return
    }

    if (!firebaseStorage) {
      toast({
        title: "Upload Error",
        description: "Storage service is not available.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Uploading Thumbnail",
      description: `Uploading ${file.name}...`,
    })

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

      toast({
        title: "Thumbnail Uploaded",
        description: "Custom thumbnail has been set.",
      })
    } catch (error: any) {
      console.error("Error uploading thumbnail:", error)
      toast({
        title: "Thumbnail Upload Failed",
        description: error.message || "Failed to upload thumbnail.",
        variant: "destructive",
      })
    }
  }

  const getPlatformIcon = (plat: string, className?: string, withBackground?: boolean) => {
    const iconPath = `/${plat.toLowerCase()}.webp`
    if (withBackground) {
      return (
        <div className={cn("h-10 w-10 rounded-full bg-white dark:bg-white flex items-center justify-center shadow-sm", className)}>
          <img src={iconPath} alt={plat} className="h-6 w-6 object-contain" />
        </div>
      )
    }
    return (
      <img src={iconPath} alt={plat} className={cn("h-6 w-6 object-contain", className)} />
    )
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
    if (selectedPlatforms.includes("instagram")) {
      guidelines.push({
        id: "instagram",
        title: "Instagram Guidelines",
        content: instagramPostType === "reel"
          ? "Reels should be 9:16 aspect ratio and under 90 seconds for best engagement."
          : "Posts work best as square (1:1) or portrait (4:5) images.",
        icon: <Instagram className="h-5 w-5" />,
        color: "bg-pink-50 text-pink-600"
      })
    }
    if (selectedPlatforms.includes("threads")) {
      guidelines.push({
        id: "threads",
        title: "Threads Posting",
        content: "Threads is great for text-first content. Images and videos up to 5 minutes are supported.",
        icon: <Share2 className="h-5 w-5" />,
        color: "bg-slate-100 text-slate-800"
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
    if (selectedPlatforms.includes("linkedin")) {
      guidelines.push({
        id: "linkedin",
        title: "LinkedIn Professional Tips",
        content: "Professional and educational content performs best. Use 3-5 relevant hashtags and keep the tone professional.",
        icon: <Linkedin className="h-5 w-5" />,
        color: "bg-blue-50 text-blue-700"
      })
    }
    if (selectedPlatforms.includes("bluesky")) {
      guidelines.push({
        id: "bluesky",
        title: "Bluesky Tips",
        content: "Bluesky posts work best with concise text. You can also include up to 4 images.",
        icon: getPlatformIcon("bluesky", "h-5 w-5"),
        color: "bg-blue-50 text-blue-600"
      })
    }
    return guidelines
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    // Proactive Validation
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.")
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (!content && mediaUrls.length === 0) {
      setError("Please provide some content or media for your post.")
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // Use tracked mediaType (set at upload time) - more reliable than URL regex for Firebase Storage URLs
    const isVideo = mediaType === "video"
    const hasMedia = mediaUrls.length > 0

    for (const platform of selectedPlatforms) {
      if (platform === "instagram" && !hasMedia) {
        setError("Instagram requires an image or video for all post types.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      if (platform === "tiktok" && (!hasMedia || !isVideo)) {
        setError("TikTok only accepts video files. Please upload a video.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      if (platform === "pinterest" && !hasMedia) {
        setError("Pinterest requires an image or video for all pins.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      if (platform === "youtube" && youtubeAspectRatio !== "community" && (!hasMedia || !isVideo)) {
        setError("YouTube video/short posts require a video file.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
    }

    try {
      const postData: any = {
        title: content.substring(0, 50) || "New Post",
        description: content.substring(0, 100) || "Created from scheduler",
        content,
        platforms: selectedPlatforms,
        platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] : (selectedPlatforms.length > 1 ? "multiple" : "unknown"),
        contentType: hasMedia ? (mediaType === "video" ? "video" : "image") : "text",
        mediaUrl: mediaUrls[0] || null,
        mediaUrls: mediaUrls,
        thumbnailUrl,
        scheduledFor: (() => {
          try {
            if (!scheduledDate) return new Date().toISOString()
            const [hours, minutes] = (scheduledTime || "09:00").split(":").map(Number)
            if (isNaN(hours) || isNaN(minutes)) return new Date().toISOString()

            const d = new Date(scheduledDate)
            d.setHours(hours, minutes, 0, 0)

            // Validate future date
            if (d < new Date()) {
              throw new Error("Please select a date and time in the future.")
            }

            return d.toISOString()
          } catch (e: any) {
            throw e
          }
        })(),
        status: "scheduled" as const,
        aspectRatio: youtubeAspectRatio,
        timezone
      }

      // Add Platform Specific Fields
      if (selectedPlatforms.includes("youtube")) {
        postData.youtubePostType = youtubeAspectRatio === "community" ? "community" : (hasMedia ? (youtubeAspectRatio === "9:16" ? "short" : "video") : "community")
        postData.youtubeOptions = {
          playlist: youtubePlaylist,
          madeForKids: youtubeMadeForKids,
          ageRestriction: youtubeAgeRestriction,
          alteredContent: youtubeAlteredContent,
          tags: youtubeTags.split(",").map(t => t.trim()).filter(t => t),
          category: youtubeCategory
        }
      }

      if (selectedPlatforms.includes("instagram")) {
        postData.instagramPostType = instagramPostType
      }

      if (selectedPlatforms.includes("tiktok")) {
        postData.tiktokOptions = {
          privacy: tiktokPrivacy,
          allowComments: tiktokAllowComments,
          allowDuet: tiktokAllowDuet,
          allowStitch: tiktokAllowStitch
        }
      }

      if (selectedPlatforms.includes("threads")) {
        postData.threadsOptions = {
          replyPolicy: threadsReplyPolicy
        }
      }

      if (selectedPlatforms.includes("linkedin")) {
        postData.linkedinOptions = {
          visibility: linkedinVisibility
        }
      }

      console.log("Submitting post data:", postData)
      await createPost(postData)
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
          <div className="flex items-center gap-3">
            {connectedPlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 transition-all duration-300",
                  isPlatformSelected(platform)
                    ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black rounded-xl p-0.5 shadow-sm"
                    : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                )}
                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-all",
                  isPlatformSelected(platform) ? "bg-white" : "bg-white/80 dark:bg-white/90"
                )}>
                  {getPlatformIcon(platform, "h-6 w-6")}
                </div>
                {isPlatformSelected(platform) && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-md">
                    <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-12 w-12 border-dashed border-2 hover:border-primary hover:text-primary transition-all group"
              title="Add platform"
              onClick={() => router.push("/dashboard/connections")}
            >
              <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
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
              {mediaUrls.length > 0 && (
                <div className="px-6 pb-6">
                  {mediaType !== "video" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {mediaUrls.map((url, index) => (
                        <div key={index} className="border rounded-xl overflow-hidden relative group bg-black/5 aspect-square">
                          <img
                            src={url}
                            alt={`Media preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-[10px] backdrop-blur-md bg-white/70 dark:bg-black/70 border-none">
                                Primary
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setShowMediaUploadModal(true)}
                        className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center aspect-square hover:bg-muted/50 transition-colors"
                      >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-2">Add More</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden relative group bg-black/10">
                      <div className="relative group">
                        <video
                          ref={videoRef}
                          src={mediaUrls[0]}
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
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-lg"
                          onClick={() => {
                            setMediaUrls([])
                            setMediaType(null)
                            setThumbnailUrl("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Section */}
                  {(thumbnailUrl || mediaType === "video") && (
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
                          {mediaType === "video" && (
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

              {/* Media Upload Progress Indicator */}
              {isUploadingMedia && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-primary animate-bounce" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">Uploading Media...</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">Please keep this page open</p>
                        </div>
                      </div>
                      <div className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {Math.round(mediaUploadProgress)}%
                      </div>
                    </div>
                    <Progress value={mediaUploadProgress} className="h-2 rounded-full bg-primary/10" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t px-6 py-4 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-3">
                  {/* Media Button - Opens Upload Modal */}
                  <Dialog open={showMediaUploadModal} onOpenChange={setShowMediaUploadModal}>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isUploadingMedia}
                      onClick={() => setShowMediaUploadModal(true)}
                      className="gap-2 px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-none rounded-full transition-all hover:scale-[1.05] active:scale-[0.95] font-bold disabled:opacity-70"
                    >
                      {isUploadingMedia ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          <span>Add Media</span>
                        </>
                      )}
                    </Button>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                        <DialogDescription>
                          Add images or videos to your post.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        {/* Upload Area */}
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowMediaUploadModal(false)
                          }}
                          className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group"
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Click to upload</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports images and videos</p>
                          </div>
                        </button>

                        {/* Library Option */}
                        {mediaItems.length > 0 && (
                          <>
                            <div className="relative flex items-center">
                              <div className="flex-grow border-t border-border" />
                              <span className="px-3 text-xs text-muted-foreground">or</span>
                              <div className="flex-grow border-t border-border" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowMediaLibrary(true)
                                setShowMediaUploadModal(false)
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                            >
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                <ImageIconLucide className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Select from Library</p>
                                <p className="text-xs text-muted-foreground">{mediaItems.length} items available</p>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Crop Image Option - High visibility next to Add Media */}
                  {mediaUrls.length > 0 && mediaType === "image" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditImage}
                      className="gap-2 h-12 px-6 rounded-full border-primary/20 hover:bg-primary/5 text-primary font-bold transition-all hover:scale-[1.05] active:scale-[0.95] dark:border-primary/40 dark:hover:bg-primary/10"
                    >
                      <Scissors className="h-5 w-5" />
                      <span>Crop Image</span>
                    </Button>
                  )}

                  {/* Hidden Input moved outside dropdown to prevent unmounting issues */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                  />

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

              </div>
            </CardContent>
          </Card >

          {/* Media Uploader Section */}
          < Collapsible open={showMediaUploader} onOpenChange={setShowMediaUploader} >
            <CollapsibleContent className="space-y-4">
              <Card className="shadow-sm border-dashed">
                <CardContent className="p-6">
                  <MediaUploader onUpload={handleMediaUpload} />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible >

          {/* Media Library Dialog */}
          < Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary} >
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
                        setMediaUrls([item.url])
                        setMediaType(item.type === "video" ? "video" : "image")
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
          </Dialog >

          {/* Success Alert */}
          {
            success && (
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
            )
          }



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
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Post at</label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={cn(
                        "w-full h-11 rounded-xl border-muted/20 focus:ring-primary/20",
                        (() => {
                          if (!scheduledDate) return ""
                          const [h, m] = (scheduledTime || "00:00").split(":").map(Number)
                          const d = new Date(scheduledDate)
                          d.setHours(h, m, 0, 0)
                          return d < new Date() ? "border-destructive text-destructive bg-destructive/5" : ""
                        })()
                      )}
                    />
                    {(() => {
                      if (!scheduledDate) return null
                      const [h, m] = (scheduledTime || "00:00").split(":").map(Number)
                      const d = new Date(scheduledDate)
                      d.setHours(h, m, 0, 0)
                      if (d < new Date()) {
                        return <p className="text-[10px] text-destructive font-bold mt-1 animate-in fade-in slide-in-from-top-1">⚠️ Cannot schedule in the past</p>
                      }
                      return null
                    })()}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Times follow your local location ({timezone})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Specific Options */}
          {
            selectedPlatforms.includes("youtube") && (
              <Card className="shadow-2xl border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white flex items-center justify-center shadow-sm border border-black/5">
                        {getPlatformIcon("youtube", "h-7 w-7")}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">YouTube Settings</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Fine-tune your video publication</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Category</Label>
                        <Select value={youtubeCategory} onValueChange={setYoutubeCategory}>
                          <SelectTrigger className="rounded-2xl h-11 border-muted/20 focus:ring-primary/20">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/20 backdrop-blur-xl">
                            <SelectItem value="22">People & Blogs</SelectItem>
                            <SelectItem value="10">Music</SelectItem>
                            <SelectItem value="23">Comedy</SelectItem>
                            <SelectItem value="24">Entertainment</SelectItem>
                            <SelectItem value="20">Gaming</SelectItem>
                            <SelectItem value="1">Film & Animation</SelectItem>
                            <SelectItem value="27">Education</SelectItem>
                            <SelectItem value="28">Science & Tech</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Format</Label>
                        <Select value={youtubeAspectRatio || "9:16"} onValueChange={(val: any) => setYoutubeAspectRatio(val)}>
                          <SelectTrigger className="rounded-2xl h-11 border-muted/20 focus:ring-primary/20">
                            <SelectValue placeholder="Aspect Ratio" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/20 backdrop-blur-xl">
                            <SelectItem value="9:16">Shorts (9:16)</SelectItem>
                            <SelectItem value="16:9">Wide (16:9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Tags</Label>
                      <Input
                        placeholder="vlog, tutorial, funny (max 500 chars)"
                        value={youtubeTags}
                        onChange={(e: any) => setYoutubeTags(e.target.value)}
                        className="rounded-2xl h-11 border-muted/20 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center justify-between space-x-2 border border-muted/10 rounded-2xl p-4 bg-muted/5 group hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <Label htmlFor="kids" className="text-xs font-bold cursor-pointer">Made for Kids</Label>
                          <span className="text-[10px] text-muted-foreground font-medium">Is this content for children?</span>
                        </div>
                        <Switch
                          id="kids"
                          checked={youtubeMadeForKids}
                          onCheckedChange={setYoutubeMadeForKids}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2 border border-muted/10 rounded-2xl p-4 bg-muted/5 group hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <Label htmlFor="age" className="text-xs font-bold cursor-pointer">Age Restricted</Label>
                          <span className="text-[10px] text-muted-foreground font-medium">18+ content only</span>
                        </div>
                        <Switch
                          id="age"
                          checked={youtubeAgeRestriction}
                          onCheckedChange={setYoutubeAgeRestriction}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          {/* Instagram Specific Options */}
          {
            selectedPlatforms.includes("instagram") && (
              <Card className="shadow-2xl border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white flex items-center justify-center shadow-sm border border-black/5">
                      {getPlatformIcon("instagram", "h-7 w-7")}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Instagram Settings</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {mediaType === "video" ? "Video detected → Reel" : mediaType === "image" ? "Image detected → Post" : "Auto-detects from media type"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-1 bg-muted/20 rounded-2xl border border-muted/20">
                    {(["post", "reel"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setInstagramPostType(type)}
                        className={cn(
                          "flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all",
                          instagramPostType === type
                            ? "bg-white dark:bg-slate-800 shadow-sm text-pink-600"
                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        {type === "post" ? "📷 Post" : "🎬 Reel"}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    <strong>Note:</strong> Instagram Stories are not supported via the Content Publishing API.
                    Videos default to Reel, images default to Post. You can change it above.
                  </p>
                </CardContent>
              </Card>
            )
          }

          {/* TikTok Specific Options */}
          {
            selectedPlatforms.includes("tiktok") && (
              <Card className="shadow-2xl border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white flex items-center justify-center shadow-sm border border-black/5">
                      {getPlatformIcon("tiktok", "h-7 w-7")}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">TikTok Settings</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">Privacy and interactions</p>
                    </div>
                  </div>

                  <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-[10px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                      TikTok's Direct Post API requires your account to be set to <strong>Public</strong> in the TikTok app settings.
                      If your account is private, automated posting will fail.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Privacy</Label>
                      <Select value={tiktokPrivacy} onValueChange={(val: any) => setTiktokPrivacy(val)}>
                        <SelectTrigger className="rounded-2xl h-11 border-muted/20">
                          <SelectValue placeholder="Who can watch?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/20">
                          <SelectItem value="public">Public (Everyone)</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="self">Private (Only Me)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 border border-muted/10 rounded-2xl bg-muted/5 group">
                        <Label htmlFor="tt-comments" className="text-[10px] font-bold cursor-pointer">Allow Comments</Label>
                        <Switch id="tt-comments" checked={tiktokAllowComments} onCheckedChange={setTiktokAllowComments} />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-muted/10 rounded-2xl bg-muted/5 group">
                        <Label htmlFor="tt-duet" className="text-[10px] font-bold cursor-pointer">Allow Duet</Label>
                        <Switch id="tt-duet" checked={tiktokAllowDuet} onCheckedChange={setTiktokAllowDuet} />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-muted/10 rounded-2xl bg-muted/5 group col-span-2">
                        <Label htmlFor="tt-stitch" className="text-[10px] font-bold cursor-pointer">Allow Stitch</Label>
                        <Switch id="tt-stitch" checked={tiktokAllowStitch} onCheckedChange={setTiktokAllowStitch} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          {/* Threads Specific Options */}
          {
            selectedPlatforms.includes("threads") && (
              <Card className="shadow-2xl border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white flex items-center justify-center shadow-sm border border-black/5">
                      {getPlatformIcon("threads", "h-7 w-7")}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Threads Settings</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">Thread interaction policy</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Who can reply?</Label>
                    <Select value={threadsReplyPolicy} onValueChange={(val: any) => setThreadsReplyPolicy(val)}>
                      <SelectTrigger className="rounded-2xl h-11 border-muted/20">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/20">
                        <SelectItem value="everyone">Anyone</SelectItem>
                        <SelectItem value="followed">Profiles you follow</SelectItem>
                        <SelectItem value="mentioned">Only mentioned profiles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          }

          {/* LinkedIn Specific Options */}
          {
            selectedPlatforms.includes("linkedin") && (
              <Card className="shadow-2xl border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white flex items-center justify-center shadow-sm border border-black/5">
                      {getPlatformIcon("linkedin", "h-7 w-7")}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">LinkedIn Settings</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">Post visibility options</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Visibility</Label>
                    <Select value={linkedinVisibility} onValueChange={(val: any) => setLinkedinVisibility(val)}>
                      <SelectTrigger className="rounded-2xl h-11 border-muted/20">
                        <SelectValue placeholder="Who can see your post?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/20">
                        <SelectItem value="PUBLIC">Anyone (Public)</SelectItem>
                        <SelectItem value="CONNECTIONS">Connections only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          }


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
        </div >

        {/* Right Column - Preview */}
        < div className="space-y-4" >
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

          {/* Preview Platform Selector */}
          <div className="flex items-center -space-x-1.5 py-2 mb-2 overflow-x-auto no-scrollbar pl-1">
            {selectedPlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setPreviewPlatform(platform)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full",
                  previewPlatform === platform
                    ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black p-0 blur-0"
                    : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0 shadow-sm"
                )}
                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
              >
                {getPlatformIcon(platform, "h-10 w-10", true)}
              </button>
            ))}
          </div>

          <Tabs value={previewPlatform} onValueChange={setPreviewPlatform} className="w-full">
            <TabsContent value="tiktok" className="mt-0">
              <div className={cn(
                "relative mx-auto border-[8px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-300",
                previewView === "mobile" ? "w-[320px] h-[640px]" : "w-full min-h-[500px] border-none rounded-xl bg-black"
              )}>
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {mediaUrls.length > 0 && mediaType === "video" ? (
                    <>
                      <video src={mediaUrls[0]} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-full border border-white/10 group-hover:scale-110 transition-transform">
                          {getPlatformIcon(previewPlatform, "h-12 w-12 text-white/70")}
                        </div>
                      </div>
                    </>
                  ) : mediaUrls.length > 0 ? (
                    <img src={mediaUrls[0]} className="w-full h-full object-cover opacity-50" />
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
                  ) : mediaUrls.length > 0 ? (
                    mediaType !== "video" ?
                      <img src={mediaUrls[0]} className="w-full h-full object-contain" /> :
                      <video src={mediaUrls[0]} className="w-full h-full object-cover opacity-50" />
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

            <TabsContent value="instagram" className="mt-0">
              <div className={cn(
                "relative mx-auto border-[10px] border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-300 bg-white",
                previewView === "mobile" ? "w-[320px] h-[640px]" : "w-full min-h-[500px]"
              )}>
                {/* IG Header */}
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                      <div className="h-full w-full rounded-full bg-white p-[1.5px]">
                        <div className="h-full w-full rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <p className="text-xs font-bold">youraccount</p>
                  </div>
                  <Plus className="h-4 w-4" />
                </div>

                <div className={cn(
                  "relative bg-slate-50",
                  instagramPostType === "reel" ? "h-[450px]" : "aspect-square"
                )}>
                  {mediaUrls.length > 0 ? (
                    mediaType !== "video" ?
                      <img src={mediaUrls[0]} className="w-full h-full object-cover" /> :
                      <video src={mediaUrls[0]} className="w-full h-full object-cover" controls />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Instagram className="h-20 w-20" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <Heart className="h-5 w-5" />
                    <MessageCircle className="h-5 w-5" />
                    <Send className="h-5 w-5" />
                  </div>
                  <p className="text-xs">
                    <span className="font-bold mr-2">youraccount</span>
                    {content || "Your caption here..."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="threads" className="mt-0">
              <div className={cn(
                "mx-auto border rounded-2xl p-6 shadow-lg bg-card",
                previewView === "mobile" ? "w-[320px]" : "w-full"
              )}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="w-[2px] grow bg-slate-100 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">youraccount</p>
                      <p className="text-xs text-muted-foreground">30s</p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content || "Start a thread..."}</p>

                    {mediaUrls.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-muted/20">
                        {mediaType !== "video" ? (
                          <img src={mediaUrls[0]} className="w-full h-auto" />
                        ) : (
                          <video src={mediaUrls[0]} className="w-full h-auto" controls />
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <MessageCircle className="h-4 w-4" />
                      <Repeat2 className="h-4 w-4" />
                      <Send className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="linkedin" className="mt-0">
              <div className={cn(
                "mx-auto border rounded-xl overflow-hidden shadow-lg bg-card",
                previewView === "mobile" ? "w-[320px]" : "w-full"
              )}>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none">Your Name</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Professional Title • 1st</p>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{content || "What do you want to talk about?"}</p>
                </div>
                {mediaUrls.length > 0 && (
                  <div className="bg-slate-50 border-y border-muted/10">
                    {mediaType !== "video" ? (
                      <img src={mediaUrls[0]} className="w-full h-auto max-h-[400px] object-contain" />
                    ) : (
                      <video src={mediaUrls[0]} className="w-full h-auto max-h-[400px] object-contain" controls />
                    )}
                  </div>
                )}
                <div className="p-3 flex items-center justify-between border-t mt-2">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      <Heart className="h-4 w-4" />
                      <span className="text-[10px] font-bold">Like</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-[10px] font-bold">Comment</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      <Repeat2 className="h-4 w-4" />
                      <span className="text-[10px] font-bold">Repost</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="facebook" className="mt-0">
              <div className={cn(
                "mx-auto border rounded-xl overflow-hidden shadow-lg bg-card",
                previewView === "mobile" ? "w-[320px]" : "w-full"
              )}>
                <div className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-none">Your Page Name</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      Just now • <Share2 className="h-2.5 w-2.5" />
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{content || "What's on your mind?"}</p>
                </div>
                {mediaUrls.length > 0 && (
                  <div className="bg-slate-50 border-y border-muted/10">
                    {mediaType !== "video" ? (
                      <img src={mediaUrls[0]} className="w-full h-auto max-h-[400px] object-contain" />
                    ) : (
                      <video src={mediaUrls[0]} className="w-full h-auto max-h-[400px] object-contain" controls />
                    )}
                  </div>
                )}
                <div className="p-2 px-4 border-t flex items-center justify-between">
                  <div className="flex gap-6 py-1">
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs cursor-pointer">
                      <Heart className="h-4 w-4" /> Like
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs cursor-pointer">
                      <MessageCircle className="h-4 w-4" /> Comment
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs cursor-pointer">
                      <Share2 className="h-4 w-4" /> Share
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full h-14 text-lg font-bold shadow-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || isUploadingMedia || !content || selectedPlatforms.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Scheduling...
              </>
            ) : isUploadingMedia ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Uploading Media...
              </>
            ) : (
              <>
                <div className="flex -space-x-2 mr-2">
                  {selectedPlatforms.slice(0, 3).map((plat: any) => (
                    <div key={plat} className="p-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                      {getPlatformIcon(plat, "h-4 w-4 text-white")}
                    </div>
                  ))}
                </div>
                Schedule Post
              </>
            )}
          </Button>

          {
            error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium ml-2">{error}</AlertDescription>
              </Alert>
            )
          }
        </div >
      </div >
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.url}
          open={cropOpen}
          onCropComplete={handleManualCropComplete}
          onCancel={() => {
            setCropOpen(false)
            setImageToCrop(null)
          }}
        />
      )}
    </div >
  )
}
