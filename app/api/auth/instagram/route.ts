// Instagram OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { cookies } from "next/headers"
import { oauthHelpers, instagramOAuth } from "@/lib/oauth-utils"

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

    // Determine the host for dynamic redirect URI
    let redirectUri = config.instagram.redirectUri
    if (process.env.NODE_ENV !== "production" || redirectUri.includes("localhost")) {
      redirectUri = `${request.nextUrl.origin}/api/auth/callback/instagram`
    }

    // Build Instagram OAuth URL
    const instagramAuthUrl = instagramOAuth.getAuthUrl(state, redirectUri)

    // Store state, userId, and redirectUri in cookies
    const response = NextResponse.redirect(instagramAuthUrl)
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
    response.cookies.set("oauth_redirect_uri", redirectUri, {
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
