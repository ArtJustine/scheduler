"use client"

import { useState } from "react"
import { ArrowUpRight, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface PlatformStatsProps {
  platform: any; // Using any for platform key indexing, or better explicit string
  postCount?: number;
  followers?: number;
  connected?: boolean;
}

export function PlatformStats({ platform, postCount = 0, followers = 0, connected = false }: PlatformStatsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      // Get current user ID from Firebase Auth
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

      // Redirect to the OAuth flow with user ID
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

  const platformIcon = {
    Instagram: "/placeholder.svg?height=24&width=24",
    TikTok: "/placeholder.svg?height=24&width=24",
    YouTube: "/placeholder.svg?height=24&width=24",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{platform}</CardTitle>
        <div className="h-4 w-4">
          <img src={platformIcon[platform as keyof typeof platformIcon] || "/placeholder.svg"} alt={platform} className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{followers.toLocaleString()}</div>
        <CardDescription className="flex items-center">
          <Users className="mr-1 h-3 w-3" />
          Followers
        </CardDescription>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div>Scheduled Posts</div>
            <div>{postCount}</div>
          </div>
          <div className="mt-4">
            {connected ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/dashboard/analytics?platform=${platform.toLowerCase()}`)}
              >
                View Analytics
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
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
                    Connect Account
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
