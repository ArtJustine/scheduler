import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlatformColor } from "@/lib/utils"

interface PlatformStat {
  id: string
  platform: string
  followers: number
  followersGrowth: number
  engagement: number
  impressions: number
}

interface PlatformStatsProps {
  stats: PlatformStat[]
}

export function PlatformStats({ stats }: PlatformStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const colors = getPlatformColor(stat.platform)
        return (
          <Card key={stat.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{stat.platform}</CardTitle>
              <CardDescription>Platform performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Followers</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">{stat.followers.toLocaleString()}</div>
                    <div className="text-xs font-medium" style={{ color: stat.followersGrowth >= 0 ? "green" : "red" }}>
                      {stat.followersGrowth >= 0 ? "+" : ""}
                      {stat.followersGrowth}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Engagement</div>
                  <div className="text-xl font-bold">{stat.engagement}%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Impressions</div>
                  <div className="text-xl font-bold">{stat.impressions.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
