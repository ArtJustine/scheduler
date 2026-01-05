// Instagram OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { cookies } from "next/headers"
import { oauthHelpers } from "@/lib/oauth-utils"

export async function GET(request: NextRequest) {
  try {
    // Check if Instagram is configured
    if (!isPlatformConfigured("instagram")) {
      return NextResponse.json(
        { error: "Instagram API is not configured" },
        { status: 500 }
      )
    }

    // Get user ID from query params or cookie
    const userId = request.nextUrl.searchParams.get("userId") || (await cookies()).get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Generate state for CSRF protection
    const state = oauthHelpers.generateState()

    // Build Instagram OAuth URL
    const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize")
    instagramAuthUrl.searchParams.set("client_id", config.instagram.appId)
    instagramAuthUrl.searchParams.set("redirect_uri", config.instagram.redirectUri)
    instagramAuthUrl.searchParams.set("scope", "user_profile,user_media")
    instagramAuthUrl.searchParams.set("response_type", "code")
    instagramAuthUrl.searchParams.set("state", state)

    // Store state and userId in cookies
    const response = NextResponse.redirect(instagramAuthUrl.toString())
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutes
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
    console.error("Instagram auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Instagram authentication" },
      { status: 500 }
    )
  }
}
