// Instagram OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth error:", error)
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=instagram_auth_failed&message=${error}`
      )
    }

    // Validate required parameters
    if (!code || state !== "instagram_auth") {
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=invalid_instagram_auth`
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: "authorization_code",
        redirect_uri: config.instagram.redirectUri,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Instagram token exchange failed:", errorData)
      return NextResponse.redirect(
        `${config.app.baseUrl}/dashboard/connections?error=instagram_token_failed`
      )
    }

    const tokenData = await tokenResponse.json()

    // Store the access token securely (implement your storage logic here)
    // For now, we'll redirect with success
    console.log("Instagram auth successful:", {
      access_token: tokenData.access_token,
      user_id: tokenData.user_id,
    })

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?success=instagram_connected`
    )
  } catch (error) {
    console.error("Instagram callback error:", error)
    return NextResponse.redirect(
      `${config.app.baseUrl}/dashboard/connections?error=instagram_callback_failed`
    )
  }
}
