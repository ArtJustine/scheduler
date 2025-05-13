import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the client ID from environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "Google client ID not configured" }, { status: 500 })
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in a cookie for verification when the user returns
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/youtube`,
    )}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline&state=${state}`,
  )

  // Set the state cookie
  response.cookies.set("youtube_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
