import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Store state in cookies to verify in callback
  cookies().set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  // Get redirect URI
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/${platform}`

  // Build authorization URL based on platform
  let authUrl = ""

  switch (platform.toLowerCase()) {
  /*
    case "instagram":
      // Instagram uses Facebook Login
      authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.1873987296766962}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`
      break

    case "youtube":
      // YouTube uses Google OAuth
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.913909744920-eq12dpthfkp3ur4qahh4teuf1b69vcu0.apps.googleusercontent.com}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/youtube&response_type=code&state=${state}&access_type=offline&prompt=consent`
      break

    case "tiktok":
      // TikTok OAuth
      authUrl = `https://www.tiktok.com/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic&response_type=code&state=${state}`
      break */

    default:
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
  }

  return NextResponse.redirect(authUrl)
}
