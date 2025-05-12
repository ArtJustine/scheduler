import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Youtube, Video } from "lucide-react"
import { getPlatformColor } from "@/lib/utils"

interface PlatformEngagementCardProps {
  platform: string
  data: {
    followers: number
    engagement: number
    impressions: number
    reachGrowth: number
  }
  isLoading: boolean
}

export function PlatformEngagementCard({ platform, data, isLoading }: PlatformEngagementCardProps) {
  const platformColor = getPlatformColor(platform.toLowerCase())

  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" style={{ color: platformColor.text }} />
      case "youtube":
        return <Youtube className="h-5 w-5" style={{ color: platformColor.text }} />
      case "tiktok":
        return <Video className="h-5 w-5" style={{ color: platformColor.text }} />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{platform}</CardTitle>
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: platformColor.bg }}
        >
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Followers</p>
            <p className="text-xl font-bold">{isLoading ? "Loading..." : data.followers.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className="text-lg font-semibold">{isLoading ? "..." : data.engagement + "%"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Growth</p>
              <p className="text-lg font-semibold text-green-500">+{isLoading ? "..." : data.reachGrowth + "%"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
