// TikTok OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { config, isPlatformConfigured } from "@/lib/config"
import { tiktokOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Check if TikTok is configured
    if (!isPlatformConfigured("tiktok")) {
      return NextResponse.json(
        { error: "TikTok API is not configured" },
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

    // Generate a unique state parameter for security (CSRF protection)
    const state = oauthHelpers.generateState()

    // Generate PKCE code_verifier and code_challenge (required by TikTok)
    const codeVerifier = oauthHelpers.generateCodeVerifier()
    const codeChallenge = oauthHelpers.generateCodeChallenge(codeVerifier)

    // Determine the host for dynamic redirect URI
    let redirectUri = config.tiktok.redirectUri

    // Use request origin if we're on localhost or if config URI doesn't match current origin (e.g. Vercel preview)
    if (process.env.NODE_ENV !== "production" || !redirectUri.startsWith(request.nextUrl.origin)) {
      redirectUri = `${request.nextUrl.origin}/api/auth/callback/tiktok`
    }

    console.log("TikTok OAuth Redirect URI being used:", redirectUri)

    // Build TikTok OAuth URL with PKCE
    const tiktokAuthUrl = tiktokOAuth.getAuthUrl(state, redirectUri, codeChallenge)
    console.log("TikTok Auth URL initiated:", tiktokAuthUrl)

    // Store state, userId, redirectUri, and code_verifier in cookies
    const response = NextResponse.redirect(tiktokAuthUrl)
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
    response.cookies.set("oauth_redirect_uri", redirectUri, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      sameSite: "lax",
    })
    response.cookies.set("oauth_code_verifier", codeVerifier, {
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
    console.error("TikTok auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate TikTok authentication" },
      { status: 500 }
    )
  }
}
