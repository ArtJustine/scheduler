import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlatformColor } from "@/lib/utils"

interface EngagementData {
  id: string
  platform: string
  likes: number
  comments: number
  shares: number
  saves: number
}

interface PlatformEngagementCardProps {
  data: EngagementData
}

export function PlatformEngagementCard({ data }: PlatformEngagementCardProps) {
  const colors = getPlatformColor(data.platform)
  const total = data.likes + data.comments + data.shares + data.saves

  const getPercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{data.platform} Engagement</CardTitle>
        <CardDescription>Breakdown of user interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.text }} />
              <div className="text-sm font-medium">Likes</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{data.likes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">({getPercentage(data.likes)}%)</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.text, opacity: 0.8 }} />
              <div className="text-sm font-medium">Comments</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{data.comments.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">({getPercentage(data.comments)}%)</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.text, opacity: 0.6 }} />
              <div className="text-sm font-medium">Shares</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{data.shares.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">({getPercentage(data.shares)}%)</div>
            </div>
          </div>
          {data.saves > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.text, opacity: 0.4 }} />
                <div className="text-sm font-medium">Saves</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{data.saves.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">({getPercentage(data.saves)}%)</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
