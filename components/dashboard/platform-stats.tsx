"use client"

import { useState } from "react"
import { ArrowUpRight, Users, Loader2, Youtube, Share2, Instagram, Clock, ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface PlatformStatsProps {
  platform: string;
  postCount?: number;
  followers?: number;
  posts?: number; // Total posts from platform
  connected?: boolean;
  username?: string;
  profileImage?: string;
}

export function PlatformStats({
  platform,
  postCount = 0,
  followers = 0,
  posts = 0,
  connected = false,
  username,
  profileImage
}: PlatformStatsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const { firebaseAuth } = await import("@/lib/firebase-client")
      const user = firebaseAuth?.currentUser

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to connect social media accounts.",
          variant: "destructive",
        })
        setIsConnecting(false)
        return
      }

      window.location.href = `/api/auth/${platform.toLowerCase()}?userId=${user.uid}`
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${platform}. Please try again.`,
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }

  const getPlatformColors = (platform: string) => {
    return "text-primary bg-primary/10";
  }

  return (
    <Card className={cn(connected && "border-primary/20 shadow-sm")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {connected && profileImage ? (
            <img src={profileImage} alt={username} className="h-6 w-6 rounded-full" />
          ) : (
            <div className={cn("p-1 h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100")}>
              <img
                src={`/${platform.toLowerCase() === 'x' ? 'x' : platform.toLowerCase()}.webp`}
                alt={platform}
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-medium">{platform}</CardTitle>
            {connected && username && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{username}</p>
            )}
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            Connected
          </div>
        ) : (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Not Connected
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div className="text-2xl font-bold">{followers.toLocaleString()}</div>
            <CardDescription className="flex items-center text-[10px]">
              <Users className="mr-1 h-3 w-3" />
              {platform.toLowerCase() === "youtube" ? "Subscribers" : "Followers"}
            </CardDescription>
          </div>
          <div>
            <div className="text-2xl font-bold">{posts.toLocaleString()}</div>
            <CardDescription className="flex items-center text-[10px]">
              <ImageIcon className="mr-1 h-3 w-3" />
              {platform.toLowerCase() === "youtube" ? "Videos" : "Posts"}
            </CardDescription>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs mb-4">
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Scheduled
            </div>
            <div className="font-semibold">{postCount}</div>
          </div>

          {connected ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs font-medium"
              onClick={() => router.push(`/dashboard/analytics?platform=${platform.toLowerCase()}`)}
            >
              Analytics Dashboard
              <ArrowUpRight className="ml-1.5 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full h-8 text-xs font-medium"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect {platform}
                  <ArrowUpRight className="ml-1.5 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

