// YouTube OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { youtubeOAuth, oauthHelpers } from "@/lib/oauth-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("YouTube OAuth error:", error)
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=youtube_auth_failed&message=${error}`
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=invalid_youtube_auth`
      )
    }

    // Exchange authorization code for access token
    const tokenData = await youtubeOAuth.exchangeCodeForToken(code)

    // Store the access token securely (implement your storage logic here)
    // For now, we'll log the successful authentication
    console.log("YouTube auth successful:", {
      access_token: tokenData.access_token,
      platform: tokenData.platform,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token ? "present" : "not present",
    })

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?success=youtube_connected`
    )
  } catch (error) {
    console.error("YouTube callback error:", error)
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?error=youtube_callback_failed`
    )
  }
}
