"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { SocialConnect } from "@/components/dashboard/social-connect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { SocialAccounts } from "@/types/social"

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccounts>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const success = searchParams.get("success")
  const error = searchParams.get("error")

  const loadAccounts = async () => {
    setIsLoading(true)
    try {
      const socialAccounts = await getSocialAccounts()
      setAccounts(socialAccounts)
    } catch (error) {
      console.error("Error loading social accounts:", error)
      toast({
        variant: "destructive",
        title: "Failed to load accounts",
        description: "There was a problem loading your connected accounts.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (success) {
      toast({
        title: "Account connected",
        description: "Your social media account has been connected successfully.",
      })
    } else if (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description:
          error === "access_denied"
            ? "You denied access to your account."
            : "There was a problem connecting your account.",
      })
    }
  }, [success, error, toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Media Connections</h1>
        <p className="text-muted-foreground">Connect your social media accounts to enable scheduling</p>
      </div>

      {success && (
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your social media account has been connected successfully.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "access_denied"
              ? "You denied access to your account."
              : "There was a problem connecting your account."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="instagram" className="space-y-6">
        <TabsList>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="instagram" className="space-y-6">
          <SocialConnect
            platform="instagram"
            connectedAccount={accounts.instagram}
            onConnect={loadAccounts}
            onDisconnect={loadAccounts}
          />

          {accounts.instagram && (
            <Card>
              <CardHeader>
                <CardTitle>Instagram Account Details</CardTitle>
                <CardDescription>Information about your connected Instagram account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">{accounts.instagram.followers?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold text-green-500">+{accounts.instagram.followersGrowth || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-2xl font-bold">{accounts.instagram.engagement || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-2xl font-bold">{accounts.instagram.posts || "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tiktok" className="space-y-6">
          <SocialConnect
            platform="tiktok"
            connectedAccount={accounts.tiktok}
            onConnect={loadAccounts}
            onDisconnect={loadAccounts}
          />

          {accounts.tiktok && (
            <Card>
              <CardHeader>
                <CardTitle>TikTok Account Details</CardTitle>
                <CardDescription>Information about your connected TikTok account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">{accounts.tiktok.followers?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold text-green-500">+{accounts.tiktok.followersGrowth || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-2xl font-bold">{accounts.tiktok.engagement || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-2xl font-bold">{accounts.tiktok.posts || "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6">
          <SocialConnect
            platform="youtube"
            connectedAccount={accounts.youtube}
            onConnect={loadAccounts}
            onDisconnect={loadAccounts}
          />

          {accounts.youtube && (
            <Card>
              <CardHeader>
                <CardTitle>YouTube Account Details</CardTitle>
                <CardDescription>Information about your connected YouTube account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Subscribers</p>
                    <p className="text-2xl font-bold">{accounts.youtube.followers?.toLocaleString() || "0"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold text-green-500">+{accounts.youtube.followersGrowth || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-2xl font-bold">{accounts.youtube.engagement || "0"}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Videos</p>
                    <p className="text-2xl font-bold">{accounts.youtube.posts || "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
