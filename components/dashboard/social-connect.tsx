"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Youtube, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

  const handleConnect = async (platform: string) => {
    setIsConnecting(platform)

    try {
      // In a real implementation, this would redirect to the OAuth flow
      if (onConnect) {
        onConnect(platform)
      } else {
        // Simulate OAuth redirect
        window.location.href = `/api/auth/${platform.toLowerCase()}`
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Could not connect to ${platform}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (platform: string) => {
    setIsConnecting(platform)

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
      setIsConnecting(null)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      case "tiktok":
        return <MessageSquare className="h-5 w-5" />
      default:
        return null
    }
  }

  const platforms = [
    {
      name: "Instagram",
      description: "Connect your Instagram account to schedule posts and view analytics",
    },
    {
      name: "YouTube",
      description: "Connect your YouTube channel to schedule videos and view analytics",
    },
    {
      name: "TikTok",
      description: "Connect your TikTok account to schedule videos and view analytics",
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
              </div>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected && (
                <div className="text-sm">
                  <p className="font-medium">Connected as:</p>
                  <p className="text-muted-foreground">{connectedAccount.username}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isConnected ? (
                <Button
                  variant="outline"
                  onClick={() => handleDisconnect(platform.name)}
                  disabled={isConnecting === platform.name}
                >
                  {isConnecting === platform.name ? "Disconnecting..." : "Disconnect"}
                </Button>
              ) : (
                <Button onClick={() => handleConnect(platform.name)} disabled={isConnecting === platform.name}>
                  {isConnecting === platform.name ? "Connecting..." : `Login with ${platform.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
