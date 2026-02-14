// Instagram OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { isPlatformConfigured } from "@/lib/config"
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

    // Get user ID and workspace ID from query params
    const userId = request.nextUrl.searchParams.get("userId") || (await cookies()).get("userId")?.value
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Generate state for CSRF protection
    const state = oauthHelpers.generateState()

    // Use INSTAGRAM_REDIRECT_URI if set (must match Meta app's Valid OAuth Redirect URIs exactly).
    // Otherwise use request origin so localhost and production work without env changes.
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/auth/callback/instagram`

    // Build Instagram OAuth URL from shared helper to keep endpoint/scope consistent.
    const instagramAuthUrl = instagramOAuth.getAuthUrl(state, redirectUri)

    // Lightweight runtime check to validate production env values quickly.
    if (request.nextUrl.searchParams.get("debug") === "1") {
      return NextResponse.json({
        platform: "instagram",
        runtime: {
          origin: request.nextUrl.origin,
          redirectUri,
          appId: (process.env.INSTAGRAM_APP_ID || "").slice(0, 6),
          usingEnvAppId: Boolean(process.env.INSTAGRAM_APP_ID),
          usingEnvSecret: Boolean(process.env.INSTAGRAM_APP_SECRET),
        },
        authUrlPreview: instagramAuthUrl,
      })
    }

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

    if (workspaceId) {
      response.cookies.set("oauth_workspace_id", workspaceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600,
        sameSite: "lax",
      })
    }

    return response
  } catch (error) {
    console.error("Instagram auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Instagram authentication" },
      { status: 500 }
    )
  }
}
