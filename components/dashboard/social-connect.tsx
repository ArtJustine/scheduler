"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Youtube, Video, Trash2, Loader2, AlertCircle, Facebook, Twitter, MessageSquare, Share2, CheckCircle2, Linkedin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
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
    profileImage?: string
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
    const iconPath = `/${platform.toLowerCase()}.webp`
    const alt = platform

    // Map some platform names to their icon files if they differ
    let finalPath = iconPath
    if (platform.toLowerCase() === "twitter" || platform.toLowerCase() === "x") {
      finalPath = "/x.webp"
    } else if (platform.toLowerCase() === "threads") {
      finalPath = "/threads.webp"
    }

    const img = (
      <img
        src={finalPath}
        alt={alt}
        className="h-3.5 w-3.5 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    )

    return (
      <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100 flex items-center justify-center h-6 w-6">
        {img}
      </div>
    )
  }

  const platforms = [
    {
      name: "Facebook",
      description: "Connect your Facebook Page to schedule and publish posts",
      disabled: false,
    },
    {
      name: "Instagram",
      description: "Connect your Instagram Business account to schedule posts and stories",
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
      name: "Threads",
      description: "Connect your Threads account to schedule and publish posts",
      disabled: false,
    },
    {
      name: "Pinterest",
      description: "Connect your Pinterest account to schedule and publish pins",
      disabled: false,
    },
    {
      name: "LinkedIn",
      description: "Connect your LinkedIn profile to schedule and publish posts",
      disabled: false,
    },
    {
      name: "X",
      description: "Connect your X account to schedule and publish posts",
      disabled: false,
    },
    {
      name: "Bluesky",
      description: "Connect your Bluesky account to schedule and publish posts",
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

        // Debug logging
        console.log(`Platform: ${platform.name}, Connected Account:`, connectedAccount, `Is Connected: ${isConnected}`)
        console.log(`All connected accounts:`, connectedAccounts)

        return (
          <Card key={platform.name} className={isConnected ? "border-primary border-2 shadow-sm" : ""}>
            <CardHeader>
              <div className="flex items-start gap-3">
                {isConnected && connectedAccount?.profileImage ? (
                  <img
                    src={connectedAccount.profileImage}
                    alt={connectedAccount.username}
                    className="h-10 w-10 rounded-full border-2 border-primary"
                  />
                ) : (
                  <div className={isConnected ? "text-primary" : ""}>
                    {getPlatformIcon(platform.name)}
                  </div>
                )}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    {isConnected && (
                      <Badge className="bg-primary text-primary-foreground gap-1 border-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  {isConnected && (
                    <span className="text-sm text-muted-foreground mt-1">
                      @{connectedAccount?.username}
                    </span>
                  )}
                </div>
                {platform.disabled && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                    Disabled
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2">{platform.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {platform.disabled && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
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
