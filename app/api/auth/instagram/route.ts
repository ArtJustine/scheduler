import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the client ID from environment variables
  const clientId = process.env.INSTAGRAM_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "Instagram client ID not configured" }, { status: 500 })
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in a cookie for verification when the user returns
  const response = NextResponse.redirect(
    `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/instagram`,
    )}&scope=user_profile,user_media&response_type=code&state=${state}`,
  )

  // Set the state cookie
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
