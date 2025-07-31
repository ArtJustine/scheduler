// YouTube OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { youtubeOAuth, oauthHelpers } from "@/lib/oauth-utils"

export async function GET(request: NextRequest) {
  try {
    // Check if YouTube is configured
    if (!isPlatformConfigured("youtube")) {
      return NextResponse.json(
        { error: "YouTube API is not configured" },
        { status: 500 }
      )
    }

    // Generate a unique state parameter for security
    const state = oauthHelpers.generateState()

    // Build YouTube OAuth URL
    const youtubeAuthUrl = youtubeOAuth.getAuthUrl(state)

    // Redirect to YouTube OAuth
    return NextResponse.redirect(youtubeAuthUrl)
  } catch (error) {
    console.error("YouTube auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate YouTube authentication" },
      { status: 500 }
    )
  }
}
