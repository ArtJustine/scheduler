import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface PlatformDimensionsInfoProps {
  platform: string
  contentType: string
}

export function PlatformDimensionsInfo({ platform, contentType }: PlatformDimensionsInfoProps) {
  const getDimensionsInfo = () => {
    if (platform === "instagram") {
      switch (contentType) {
        case "image":
          return {
            title: "Instagram Post",
            description: "Recommended size: 1080 x 1080 pixels (1:1 square ratio)",
          }
        case "story":
          return {
            title: "Instagram Story",
            description: "Recommended size: 1080 x 1920 pixels (9:16 portrait ratio)",
          }
        case "reel":
          return {
            title: "Instagram Reel",
            description: "Recommended size: 1080 x 1920 pixels (9:16 portrait ratio)",
          }
        case "carousel":
          return {
            title: "Instagram Carousel",
            description: "Recommended size: 1080 x 1080 pixels (1:1 square ratio) for all images",
          }
        default:
          return null
      }
    } else if (platform === "tiktok") {
      return {
        title: "TikTok Video",
        description: "Recommended size: 1080 x 1920 pixels (9:16 portrait ratio)",
      }
    } else if (platform === "youtube") {
      switch (contentType) {
        case "video":
          return {
            title: "YouTube Video",
            description: "Recommended size: 1920 x 1080 pixels (16:9 landscape ratio)",
          }
        case "shorts":
          return {
            title: "YouTube Shorts",
            description: "Recommended size: 1080 x 1920 pixels (9:16 portrait ratio)",
          }
        default:
          return null
      }
    }

    return null
  }

  const info = getDimensionsInfo()

  if (!info) return null

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{info.title}</AlertTitle>
      <AlertDescription>{info.description}</AlertDescription>
    </Alert>
  )
}
