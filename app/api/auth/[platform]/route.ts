import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Get redirect URI
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/${platform}`

  // Build authorization URL based on platform
  let authUrl = ""

  switch (platform.toLowerCase()) {
    case "instagram": {
      const clientId = process.env.INSTAGRAM_CLIENT_ID
      if (!clientId) {
        return NextResponse.json({ error: "Missing Instagram client ID" }, { status: 500 })
      }
      authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`
      break
    }
    case "youtube": {
      const clientId = process.env.YOUTUBE_CLIENT_ID
      if (!clientId) {
        return NextResponse.json({ error: "Missing YouTube client ID" }, { status: 500 })
      }
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/youtube&response_type=code&state=${state}&access_type=offline&prompt=consent`
      break
    }
    case "tiktok": {
      const clientKey = process.env.TIKTOK_CLIENT_KEY
      if (!clientKey) {
        return NextResponse.json({ error: "Missing TikTok client key" }, { status: 500 })
      }
      authUrl = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic&response_type=code&state=${state}`
      break
    }
    default:
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
  }

  // Set state in cookies on the redirect response
  const response = NextResponse.redirect(authUrl)
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })
  return response
}
