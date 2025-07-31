// TikTok OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { tiktokOAuth, oauthHelpers } from "@/lib/oauth-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("TikTok OAuth error:", error)
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=tiktok_auth_failed&message=${error}`
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=invalid_tiktok_auth`
      )
    }

    // Exchange authorization code for access token
    const tokenData = await tiktokOAuth.exchangeCodeForToken(code)

    // Store the access token securely (implement your storage logic here)
    // For now, we'll log the successful authentication
    console.log("TikTok auth successful:", {
      access_token: tokenData.access_token,
      platform: tokenData.platform,
      expires_in: tokenData.expires_in,
    })

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?success=tiktok_connected`
    )
  } catch (error) {
    console.error("TikTok callback error:", error)
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?error=tiktok_callback_failed`
    )
  }
}
