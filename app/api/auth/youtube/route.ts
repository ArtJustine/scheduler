// YouTube OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { youtubeOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Check if YouTube is configured
    if (!isPlatformConfigured("youtube")) {
      return NextResponse.json(
        { error: "YouTube API is not configured" },
        { status: 500 }
      )
    }

    // Get user ID from query params or cookie
    const userId = request.nextUrl.searchParams.get("userId") || cookies().get("userId")?.value
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Generate a unique state parameter for security
    const state = oauthHelpers.generateState()

    // Build YouTube OAuth URL
    const youtubeAuthUrl = youtubeOAuth.getAuthUrl(state)

    // Store state and userId in cookies
    const response = NextResponse.redirect(youtubeAuthUrl)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      sameSite: "lax",
    })
    response.cookies.set("oauth_user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("YouTube auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate YouTube authentication" },
      { status: 500 }
    )
  }
}
