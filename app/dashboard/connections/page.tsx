"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, CheckCircle, XCircle } from "lucide-react"
import { SocialConnect } from "@/components/dashboard/social-connect"
import { useToast } from "@/components/ui/use-toast"
type SocialAccount = {
  id: string
  platform: string
  username: string
  connected: boolean
}
import { useRouter, useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ConnectionsPage() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true)
        const { getSocialAccounts } = await import("@/lib/firebase/social-accounts")
        const accountsData = await getSocialAccounts()
        
        // Transform the accounts data to match the expected format
        const accounts: SocialAccount[] = []
        if (accountsData.instagram) {
          accounts.push({
            id: accountsData.instagram.id || "instagram",
            platform: "instagram",
            username: accountsData.instagram.username || "Instagram User",
            connected: true,
          })
        }
        if (accountsData.youtube) {
          accounts.push({
            id: accountsData.youtube.id || "youtube",
            platform: "youtube",
            username: accountsData.youtube.username || "YouTube Channel",
            connected: true,
          })
        }
        if (accountsData.tiktok) {
          accounts.push({
            id: accountsData.tiktok.id || "tiktok",
            platform: "tiktok",
            username: accountsData.tiktok.username || "TikTok User",
            connected: true,
          })
        }
        
        setSocialAccounts(accounts)
      } catch (error) {
        console.error("Error loading social accounts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const message = searchParams.get("message")

    if (success) {
      const platform = success.replace("_connected", "")
      toast({
        title: "Connection Successful!",
        description: `Your ${platform} account has been successfully connected.`,
      })
      // Clear the URL parameters
      router.replace("/dashboard/connections")
    }

    if (error) {
      const platform = error.replace("_auth_failed", "").replace("_callback_failed", "").replace("_token_failed", "").replace("invalid_", "")
      toast({
        title: "Connection Failed",
        description: message || `Failed to connect your ${platform} account. Please try again.`,
        variant: "destructive",
      })
      // Clear the URL parameters
      router.replace("/dashboard/connections")
    }
  }, [searchParams, toast, router])

  // Helper to get account for a platform
  const getAccount = (platform: string) =>
    socialAccounts.find((acc) => acc.platform.toLowerCase() === platform)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button
            onClick={() => router.back()}
            className="mr-2 p-2 rounded hover:bg-muted"
            aria-label="Back"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-5 w-5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">Social Connections</h1>
      </div>
      <p className="text-muted-foreground">Connect your social media accounts to schedule and publish content</p>
      <Tabs defaultValue="instagram" className="space-y-4">
        <TabsList className="hidden">
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
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
                  connectedAccounts={socialAccounts.filter(acc => acc.platform.toLowerCase() === "instagram")}
                  onDisconnect={async (platform) => {
                    try {
                      const { disconnectSocialAccount } = await import("@/lib/firebase/social-accounts")
                      await disconnectSocialAccount(platform.toLowerCase() as any)
                      toast({
                        title: "Account Disconnected",
                        description: `Your ${platform} account has been disconnected.`,
                      })
                      // Reload accounts
                      const { getSocialAccounts } = await import("@/lib/firebase/social-accounts")
                      const accountsData = await getSocialAccounts()
                      const accounts: SocialAccount[] = []
                      if (accountsData.instagram) {
                        accounts.push({
                          id: accountsData.instagram.id || "instagram",
                          platform: "instagram",
                          username: accountsData.instagram.username || "Instagram User",
                          connected: true,
                        })
                      }
                      if (accountsData.youtube) {
                        accounts.push({
                          id: accountsData.youtube.id || "youtube",
                          platform: "youtube",
                          username: accountsData.youtube.username || "YouTube Channel",
                          connected: true,
                        })
                      }
                      if (accountsData.tiktok) {
                        accounts.push({
                          id: accountsData.tiktok.id || "tiktok",
                          platform: "tiktok",
                          username: accountsData.tiktok.username || "TikTok User",
                          connected: true,
                        })
                      }
                      setSocialAccounts(accounts)
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to disconnect account",
                        variant: "destructive",
                      })
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Removed YouTube and TikTok tabs per request */}
      </Tabs>
    </div>
  )
}
