"use client"

import { ArrowUpRight, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function PlatformStats({ platform, postCount = 0, followers = 0, connected = false }) {
  const router = useRouter()

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
          <img src={platformIcon[platform] || "/placeholder.svg"} alt={platform} className="h-4 w-4" />
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
                onClick={() => router.push("/dashboard/connections")}
              >
                Connect Account
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
