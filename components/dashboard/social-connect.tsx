"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { disconnectSocialAccount } from "@/lib/firebase/social-accounts"
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
import { Loader2, Instagram, Youtube, Video, ExternalLink, Trash2 } from "lucide-react"
import type { SocialAccountType } from "@/types/social"

interface SocialConnectProps {
  platform: SocialAccountType
  connectedAccount: any | null
  onConnect: () => void
  onDisconnect: () => void
}

export function SocialConnect({ platform, connectedAccount, onConnect, onDisconnect }: SocialConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { toast } = useToast()

  const getPlatformIcon = () => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      case "tiktok":
        return <Video className="h-5 w-5" />
      default:
        return null
    }
  }

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  const getAuthProvider = () => {
    switch (platform) {
      case "instagram":
        return "Facebook" // Instagram uses Facebook login
      case "youtube":
        return "Google"
      case "tiktok":
        return "TikTok"
      default:
        return ""
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Redirect to the OAuth flow
      window.location.href = `/api/auth/${platform}`
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: `There was a problem connecting your ${getPlatformName()} account.`,
      })
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnectSocialAccount(platform)
      toast({
        title: "Account disconnected",
        description: `Your ${getPlatformName()} account has been disconnected.`,
      })
      onDisconnect()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: `There was a problem disconnecting your ${getPlatformName()} account.`,
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlatformIcon()}
          {getPlatformName()}
        </CardTitle>
        <CardDescription>
          {connectedAccount
            ? `Connected as ${connectedAccount.username}`
            : `Connect your ${getPlatformName()} account for scheduling`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!connectedAccount ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Connect your {getPlatformName()} account to schedule posts and view analytics.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    {getPlatformIcon()}
                    <span className="ml-2">Login with {getAuthProvider()}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center border rounded-md p-3">
              <div>
                <p className="font-medium">{connectedAccount.username}</p>
                <p className="text-xs text-muted-foreground">
                  Connected on {new Date(connectedAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>
              {connectedAccount.profileUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={connectedAccount.profileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {connectedAccount && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your {getPlatformName()} account. Any scheduled posts for this platform will
                  remain but cannot be published automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect} disabled={isDisconnecting}>
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}
