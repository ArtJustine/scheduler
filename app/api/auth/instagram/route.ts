// Instagram OAuth Authentication Route
import { NextRequest, NextResponse } from "next/server"
import { isPlatformConfigured, config } from "@/lib/config"
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

    // Generate state with embedded metadata for "Stateless" recovery if cookies fail
    // Format: "random:userId:workspaceId" (Base64 encoded)
    const randomNonce = oauthHelpers.generateState()
    const statePayload = JSON.stringify({
      nonce: randomNonce,
      uid: userId,
      wid: workspaceId || ""
    })
    const state = Buffer.from(statePayload).toString("base64")

    // Use the unified config redirect URI to ensure it matches the callback's fallback
    // This prevents "Error validating verification code" due to origin mismatches (www vs non-www)
    const redirectUri = config.instagram.redirectUri

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

    // Determine cookie domain (lax logic for root domain sharing)
    // If usage is on "www.chiyusocial.com", we want to set cookie on ".chiyusocial.com"
    // so it persists if redirected to "chiyusocial.com"
    const hostname = request.nextUrl.hostname
    const isProduction = process.env.NODE_ENV === "production"

    // Simple heuristic for root domain: take last 2 parts (co.uk handled poorly, but com/net/org fine)
    // For specific custom domain "chiyusocial.com", this works.
    let cookieDomain = undefined
    if (isProduction && hostname.includes("chiyusocial.com")) {
      cookieDomain = ".chiyusocial.com"
    }

    // Store state, userId, and redirectUri in cookies
    const response = NextResponse.redirect(instagramAuthUrl)

    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true for SameSite=None
      maxAge: 600, // 10 minutes
      sameSite: "none" as const,
      domain: cookieDomain
    }

    response.cookies.set("oauth_state", state, cookieOptions)
    response.cookies.set("oauth_user_id", userId, cookieOptions)
    response.cookies.set("oauth_redirect_uri", redirectUri, cookieOptions)

    if (workspaceId) {
      response.cookies.set("oauth_workspace_id", workspaceId, cookieOptions)
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
