import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase/config"

// This function handles the initial OAuth redirect
export async function GET(request: Request, { params }: { params: { platform: string } }) {
  const platform = params.platform

  // Get the current user
  const currentUser = auth.currentUser
  if (!currentUser) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Generate state parameter to prevent CSRF attacks
  const state = Math.random().toString(36).substring(2, 15)

  // Store state in cookies for verification later
  const response = NextResponse.redirect(getOAuthUrl(platform, state))
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}

function getOAuthUrl(platform: string, state: string): URL {
  switch (platform) {
    case "instagram":
      return new URL(
        `https://api.instagram.com/oauth/authorize?client_id=${process.env.1873987296766962}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/api/auth/callback/instagram")}&scope=user_profile,user_media&response_type=code&state=${state}`,
      )
    case "youtube":
      return new URL(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.913909744920-eq12dpthfkp3ur4qahh4teuf1b69vcu0.apps.googleusercontent.com}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/api/auth/callback/youtube")}&scope=https://www.googleapis.com/auth/youtube&response_type=code&access_type=offline&state=${state}`,
      ) /*
    case "tiktok":
      return new URL(
        `https://www.tiktok.com/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_URL + "/api/auth/callback/tiktok")}&scope=user.info.basic&response_type=code&state=${state}`,
      )*/
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
