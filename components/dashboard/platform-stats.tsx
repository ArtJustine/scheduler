import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Youtube, Video } from "lucide-react"
import { getPlatformColor } from "@/lib/utils"
import { Link } from "@/components/ui/link"

interface PlatformStatsProps {
  platform: string
  postCount: number
  followers?: number
  connected: boolean
}

export function PlatformStats({ platform, postCount, followers, connected }: PlatformStatsProps) {
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
        <div className="text-2xl font-bold">{postCount}</div>
        <p className="text-xs text-muted-foreground">Scheduled posts</p>

        {connected ? (
          <div className="mt-2">
            <div className="text-sm font-medium">{followers?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            <Link href="/dashboard/connections" className="text-primary underline-offset-4 hover:underline">
              Connect account
            </Link>{" "}
            for more stats
          </p>
        )}
      </CardContent>
    </Card>
  )
}
