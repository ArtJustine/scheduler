"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Youtube } from "lucide-react"

export default function TestOAuthPage() {
  if (process.env.NODE_ENV === "production") {
    return null
  }
  const handleTikTokAuth = () => {
    // Redirect to TikTok OAuth
    window.location.href = "/api/auth/tiktok"
  }

  const handleYouTubeAuth = () => {
    // Redirect to YouTube OAuth
    window.location.href = "/api/auth/youtube"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              TikTok OAuth Test
            </CardTitle>
            <CardDescription>
              Test the TikTok OAuth flow with your configured API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTikTokAuth} className="w-full">
              Test TikTok Authentication
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This will redirect you to TikTok for authorization.</p>
              <p>After authorization, you'll be redirected back to the connections page.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              YouTube OAuth Test
            </CardTitle>
            <CardDescription>
              Test the YouTube OAuth flow with your configured API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleYouTubeAuth} className="w-full">
              Test YouTube Authentication
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This will redirect you to Google/YouTube for authorization.</p>
              <p>After authorization, you'll be redirected back to the connections page.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              Check if your API keys are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.open("/api/debug/config", "_blank")} 
              variant="outline" 
              className="w-full"
            >
              Check Configuration
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This will open the debug endpoint in a new tab to show your configuration status.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 