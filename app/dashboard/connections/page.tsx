"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { SocialConnect } from "@/components/dashboard/social-connect"
import { getSocialAccounts } from "@/lib/data-service"
import type { SocialAccounts } from "@/types/social"

export default function ConnectionsPage() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true)
        const accounts = await getSocialAccounts()
        setSocialAccounts(accounts)
      } catch (error) {
        console.error("Error loading social accounts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Connections</h1>
        <p className="text-muted-foreground">Connect your social media accounts to schedule and publish content</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a UI prototype with mock data. In the real application, you would connect to actual social media
          accounts.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="instagram" className="space-y-4">
        <TabsList>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
        </TabsList>
        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>Instagram</CardTitle>
              <CardDescription>Connect your Instagram account to schedule and publish posts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <SocialConnect
                  platform="instagram"
                  account={socialAccounts.instagram}
                  onConnect={() => {
                    // In the real app, this would redirect to the Instagram auth endpoint
                    alert("In a real app, this would connect to Instagram")
                  }}
                  onDisconnect={() => {
                    // In the real app, this would disconnect the account
                    alert("In a real app, this would disconnect from Instagram")
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="youtube">
          <Card>
            <CardHeader>
              <CardTitle>YouTube</CardTitle>
              <CardDescription>Connect your YouTube account to schedule and publish videos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <SocialConnect
                  platform="youtube"
                  account={socialAccounts.youtube}
                  onConnect={() => {
                    // In the real app, this would redirect to the YouTube auth endpoint
                    alert("In a real app, this would connect to YouTube")
                  }}
                  onDisconnect={() => {
                    // In the real app, this would disconnect the account
                    alert("In a real app, this would disconnect from YouTube")
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tiktok">
          <Card>
            <CardHeader>
              <CardTitle>TikTok</CardTitle>
              <CardDescription>Connect your TikTok account to schedule and publish videos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <SocialConnect
                  platform="tiktok"
                  account={socialAccounts.tiktok}
                  onConnect={() => {
                    // In the real app, this would redirect to the TikTok auth endpoint
                    alert("In a real app, this would connect to TikTok")
                  }}
                  onDisconnect={() => {
                    // In the real app, this would disconnect the account
                    alert("In a real app, this would disconnect from TikTok")
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
