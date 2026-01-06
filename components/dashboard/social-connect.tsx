"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Youtube, Video, Trash2, Loader2, AlertCircle, Facebook, Twitter, MessageSquare, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SocialConnectProps {
  connectedAccounts?: {
    platform: string
    username: string
    connected: boolean
  }[]
  onConnect?: (platform: string) => void
  onDisconnect?: (platform: string) => void
}

export function SocialConnect({ connectedAccounts = [], onConnect, onDisconnect }: SocialConnectProps) {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)

  const handleConnect = async (platform: string) => {
    setIsConnecting(platform)

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
        setIsConnecting(null)
        return
      }

      // Redirect to the OAuth flow with user ID
      if (onConnect) {
        onConnect(platform)
      } else {
        // Use the actual OAuth endpoint with userId
        window.location.href = `/api/auth/${platform.toLowerCase()}?userId=${user.uid}`
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${platform}. Please try again.`,
        variant: "destructive",
      })
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (platform: string) => {
    setIsDisconnecting(platform)

    try {
      if (onDisconnect) {
        onDisconnect(platform)

        toast({
          title: "Account Disconnected",
          description: `Your ${platform} account has been disconnected.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Could not disconnect from ${platform}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(null)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      case "tiktok":
        return <Video className="h-5 w-5" />
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "threads":
        return <MessageSquare className="h-5 w-5" />
      case "pinterest":
        return <Share2 className="h-5 w-5" />
      default:
        return null
    }
  }

  const platforms = [
    {
      name: "Threads",
      description: "Connect your Threads account to schedule posts and view analytics",
      disabled: false,
    },
    {
      name: "TikTok",
      description: "Connect your TikTok account to schedule videos and view analytics",
      disabled: false,
    },
    {
      name: "YouTube",
      description: "Connect your YouTube account to schedule videos and view analytics",
      disabled: false,
    },
    {
      name: "Instagram",
      description: "Connect your Instagram account to schedule posts and view analytics",
      disabled: false,
    },
    {
      name: "Facebook",
      description: "Connect your Facebook account to schedule posts and view analytics",
      disabled: false,
    },
    {
      name: "Twitter",
      description: "Connect your Twitter account to schedule posts and view analytics",
      disabled: false,
    },
    {
      name: "Pinterest",
      description: "Connect your Pinterest account to schedule posts and view analytics",
      disabled: false,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {platforms.map((platform) => {
        const connectedAccount = connectedAccounts.find(
          (account) => account.platform.toLowerCase() === platform.name.toLowerCase(),
        )
        const isConnected = !!connectedAccount?.connected

        return (
          <Card key={platform.name}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getPlatformIcon(platform.name)}
                <CardTitle>{platform.name}</CardTitle>
                {platform.disabled && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Disabled</span>
                )}
              </div>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Hide "Connected as" label per request */}
              {platform.disabled && (
                <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Integration temporarily disabled</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isConnected ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disconnect your {platform.name} account. Any scheduled posts for this platform will
                        remain but cannot be published automatically.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDisconnect(platform.name)}
                        disabled={isDisconnecting === platform.name}
                      >
                        {isDisconnecting === platform.name ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          "Disconnect"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={() => handleConnect(platform.name)}
                  disabled={isConnecting === platform.name || platform.disabled}
                >
                  {isConnecting === platform.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      {getPlatformIcon(platform.name)}
                      <span className="ml-2">Login with {platform.name}</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
