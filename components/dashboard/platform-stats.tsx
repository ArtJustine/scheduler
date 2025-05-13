"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlatformColor } from "@/lib/utils"

interface PlatformStatsProps {
  stats: {
    platform: string
    followers: number
    engagement: number
    posts: number
  }[]
}

export function PlatformStats({ stats }: PlatformStatsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Tabs defaultValue="followers" className="w-full">
      <div className="flex items-center justify-between">
        <CardTitle>Platform Stats</CardTitle>
        <TabsList>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="followers" className="pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const colors = getPlatformColor(stat.platform)
            return (
              <Card key={stat.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.platform}</CardTitle>
                  <div className="rounded-full p-1" style={{ backgroundColor: colors.bg }}>
                    <span className="h-4 w-4 rounded-full block" style={{ backgroundColor: colors.text }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.followers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.floor(stat.followers * 0.02).toLocaleString()} from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="engagement" className="pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const colors = getPlatformColor(stat.platform)
            return (
              <Card key={stat.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.platform}</CardTitle>
                  <div className="rounded-full p-1" style={{ backgroundColor: colors.bg }}>
                    <span className="h-4 w-4 rounded-full block" style={{ backgroundColor: colors.text }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.engagement.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.random() > 0.5 ? "+" : "-"}
                    {(Math.random() * 0.5).toFixed(1)}% from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="posts" className="pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const colors = getPlatformColor(stat.platform)
            return (
              <Card key={stat.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.platform}</CardTitle>
                  <div className="rounded-full p-1" style={{ backgroundColor: colors.bg }}>
                    <span className="h-4 w-4 rounded-full block" style={{ backgroundColor: colors.text }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.posts}</div>
                  <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 5)} from last month</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>
    </Tabs>
  )
}
