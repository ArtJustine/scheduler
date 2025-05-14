"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getSocialAccounts } from "@/lib/firebase/social-accounts"
import { SocialConnect } from "@/components/dashboard/social-connect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2, WifiOff, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { SocialAccounts } from "@/types/social"

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<SocialAccounts>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const success = searchParams.get("success")
  const error = searchParams.get("error")

  // Check if we're in preview mode
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      setIsPreview(true)
    }
  }, [])

  const loadAccounts = async () => {
    setIsLoading(true)
    setIsOffline(false)
    try {
      const socialAccounts = await getSocialAccounts()
      setAccounts(socialAccounts)
    } catch (error) {
      console.error("Error loading social accounts:", error)

      // Check if the error is due to being offline
      if (error.message?.includes("offline")) {
        setIsOffline(true)
        toast({
          variant: "destructive",
          title: "You're offline",
          description: "Using demo data for preview. In production, please check your internet connection.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load accounts",
          description: "There was a problem loading your connected accounts.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        setIsOffline(false)
        loadAccounts()
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isOffline])

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
            : error === "tiktok_disabled"
              ? "TikTok integration is currently disabled."
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

  const formatAccountsForConnect = () => {
    const result = []

    if (accounts.instagram) {
      result.push({
        platform: "Instagram",
        username: accounts.instagram.username,
        connected: true,
      })
    }

    if (accounts.youtube) {
      result.push({
        platform: "YouTube",
        username: accounts.youtube.username,
        connected: true,
      })
    }

    if (accounts.tiktok) {
      result.push({
        platform: "TikTok",
        username: accounts.tiktok.username,
        connected: true,
      })
    }

    return result
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Media Connections</h1>
        <p className="text-muted-foreground">Connect your social media accounts to enable scheduling</p>
      </div>

      {isPreview && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Preview Mode</AlertTitle>
          <AlertDescription>
            You're viewing demo data in preview mode. In production, this will show your actual connected accounts.
          </AlertDescription>
        </Alert>
      )}

      {isOffline && !isPreview && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You're offline</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>Using demo data for preview. In production, please check your internet connection.</span>
            <Button onClick={loadAccounts} variant="outline" className="w-fit">
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
              : error === "tiktok_disabled"
                ? "TikTok integration is currently disabled."
                : "There was a problem connecting your account."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <SocialConnect
          connectedAccounts={formatAccountsForConnect()}
          onConnect={() => {}}
          onDisconnect={() => loadAccounts()}
        />
      </div>

      <Tabs defaultValue="instagram" className="space-y-6">
        <TabsList>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        <TabsContent value="instagram" className="space-y-6">
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
          {/* Replace TikTok account details with disabled message */}
          <Card>
            <CardHeader>
              <CardTitle>TikTok Integration Disabled</CardTitle>
              <CardDescription>TikTok integration is currently unavailable</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Integration Disabled</AlertTitle>
                <AlertDescription>
                  TikTok integration has been temporarily disabled. Please check back later.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-6">
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
