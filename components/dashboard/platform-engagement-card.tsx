import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlatformColor } from "@/lib/utils"

interface PlatformEngagementCardProps {
  platform: string
  stats: {
    likes: number
    comments: number
    shares: number
    saves?: number
  }
}

export function PlatformEngagementCard({ platform, stats }: PlatformEngagementCardProps) {
  const colors = getPlatformColor(platform)

  // Calculate total for percentage
  const total = stats.likes + stats.comments + stats.shares + (stats.saves || 0)

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
          <div className="rounded-full p-1" style={{ backgroundColor: colors.bg }}>
            <span className="h-3 w-3 rounded-full block" style={{ backgroundColor: colors.text }} />
          </div>
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
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Shares</span>
            <span className="text-xl font-bold">{stats.shares.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">{getPercentage(stats.shares)}</span>
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
