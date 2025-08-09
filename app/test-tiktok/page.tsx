"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video } from "lucide-react"

export default function TestTikTokPage() {
  if (process.env.NODE_ENV === "production") {
    return null
  }
  const handleTikTokAuth = () => {
    // Redirect to TikTok OAuth
    window.location.href = "/api/auth/tiktok"
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
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
    </div>
  )
} 