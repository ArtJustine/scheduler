// Instagram OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    // Check if Instagram is configured
    if (!isPlatformConfigured("instagram")) {
      return NextResponse.json(
        { error: "Instagram API is not configured" },
        { status: 500 }
      )
    }

    // Build Instagram OAuth URL
    const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize")
    instagramAuthUrl.searchParams.set("client_id", config.instagram.appId)
    instagramAuthUrl.searchParams.set("redirect_uri", config.instagram.redirectUri)
    instagramAuthUrl.searchParams.set("scope", "user_profile,user_media")
    instagramAuthUrl.searchParams.set("response_type", "code")
    instagramAuthUrl.searchParams.set("state", "instagram_auth")

    // Redirect to Instagram OAuth
    return NextResponse.redirect(instagramAuthUrl.toString())
  } catch (error) {
    console.error("Instagram auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Instagram authentication" },
      { status: 500 }
    )
  }
}
