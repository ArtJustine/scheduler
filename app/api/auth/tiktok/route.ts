// TikTok OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { tiktokOAuth, oauthHelpers } from "@/lib/oauth-utils"

export async function GET(request: NextRequest) {
  try {
    // Check if TikTok is configured
    if (!isPlatformConfigured("tiktok")) {
      return NextResponse.json(
        { error: "TikTok API is not configured" },
        { status: 500 }
      )
    }

    // Generate a unique state parameter for security
    const state = oauthHelpers.generateState()

    // Build TikTok OAuth URL
    const tiktokAuthUrl = tiktokOAuth.getAuthUrl(state)

    // Redirect to TikTok OAuth
    return NextResponse.redirect(tiktokAuthUrl)
  } catch (error) {
    console.error("TikTok auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate TikTok authentication" },
      { status: 500 }
    )
  }
}
