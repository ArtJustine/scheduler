import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlatformEngagementCardProps {
  platform: string
  stats: {
    likes: number
    comments: number
    saves?: number
  }
  color?: string
}

export function PlatformEngagementCard({ platform, stats, color }: PlatformEngagementCardProps) {
  // Get platform color
  const getPlatformColor = () => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "#E1306C"
      case "youtube":
        return "#FF0000"
      case "tiktok":
        return "#69C9D0"
      default:
        return color || "#888888"
    }
  }

  // Calculate total for percentage
  const total = stats.likes + stats.comments + (stats.saves || 0)

  // Function to calculate percentage
  const getPercentage = (value: number) => {
    if (total === 0) return "0%"
    return `${Math.round((value / total) * 100)}%`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{platform}</CardTitle>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getPlatformColor() }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Likes</span>
            <span className="text-xl font-bold">{stats.likes.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{getPercentage(stats.likes)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Comments</span>
            <span className="text-xl font-bold">{stats.comments.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{getPercentage(stats.comments)}</span>
          </div>
          {stats.saves !== undefined && (
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Saves</span>
              <span className="text-xl font-bold">{stats.saves.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{getPercentage(stats.saves)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
