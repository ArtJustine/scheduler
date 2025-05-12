"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { connectSocialAccount, disconnectSocialAccount } from "@/lib/firebase/social-accounts"
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
  const [username, setUsername] = useState("")
  const [accessToken, setAccessToken] = useState("")
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

  const handleConnect = async () => {
    if (!username || !accessToken) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both username and access token.",
      })
      return
    }

    setIsConnecting(true)
    try {
      await connectSocialAccount(platform, {
        username,
        accessToken,
        connected: true,
        connectedAt: new Date().toISOString(),
      })
      toast({
        title: "Account connected",
        description: `Your ${getPlatformName()} account has been connected successfully.`,
      })
      setUsername("")
      setAccessToken("")
      onConnect()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: `There was a problem connecting your ${getPlatformName()} account.`,
      })
    } finally {
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
            <div className="space-y-2">
              <Label htmlFor={`${platform}-username`}>Username</Label>
              <Input
                id={`${platform}-username`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Your ${getPlatformName()} username`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${platform}-token`}>Access Token</Label>
              <Input
                id={`${platform}-token`}
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Access token for API authorization"
              />
              <p className="text-xs text-muted-foreground">
                You can get your access token from your {getPlatformName()} developer account
              </p>
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
        {!connectedAccount ? (
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>
        ) : (
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
