import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlatformEngagementCardProps {
  platform: string
  stats: {
    likes: number
    comments: number
    views?: number
    followers?: number
    saves?: number
  }
}

export function PlatformEngagementCard({ platform, stats }: PlatformEngagementCardProps) {
  const getPlatformColors = (p: string) => {
    const name = p.toLowerCase()
    if (name.includes('tiktok')) return 'bg-teal-500'
    if (name.includes('instagram')) return 'bg-pink-600'
    if (name.includes('youtube')) return 'bg-red-600'
    if (name.includes('threads')) return 'bg-zinc-800'
    if (name.includes('linkedin')) return 'bg-blue-700'
    return 'bg-primary'
  }

  // Calculate total interactions for percentage
  const totalInteractions = stats.likes + stats.comments + (stats.saves || 0)

  const getPercentage = (value: number) => {
    if (totalInteractions === 0) return "0%"
    return `${Math.round((value / totalInteractions) * 100)}%`
  }

  return (
    <Card className="overflow-hidden border-none bg-muted/20 hover:bg-muted/30 transition-all border border-border/50">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold tracking-tight uppercase">{platform}</CardTitle>
          <div className={`h-2.5 w-2.5 rounded-full ${getPlatformColors(platform)} shadow-sm`} />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Followers</span>
            <span className="text-xl font-black">{(stats.followers || 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Reach</span>
            <span className="text-xl font-black">{(stats.views || 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Likes</span>
            <span className="text-xl font-black">{stats.likes.toLocaleString()}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{getPercentage(stats.likes)} of interactions</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Comments</span>
            <span className="text-xl font-black">{stats.comments.toLocaleString()}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{getPercentage(stats.comments)} of interactions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
