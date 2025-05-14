// Comment out the entire TikTok auth route
/*
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the client ID from environment variables
  const clientKey = process.env.TIKTOK_CLIENT_KEY

  if (!clientKey) {
    return NextResponse.json({ error: "TikTok client key not configured" }, { status: 500 })
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in a cookie for verification when the user returns
  const response = NextResponse.redirect(
    `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&redirect_uri=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/tiktok`,
    )}&scope=user.info.basic,video.list&response_type=code&state=${state}`,
  )

  // Set the state cookie
  response.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
*/

// Placeholder response for disabled TikTok integration
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.json({ error: "TikTok integration is currently disabled" }, { status: 503 })
}
