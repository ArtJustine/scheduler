import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> } // FIX 1: Must be a Promise
) {
  // FIX 2: Must await params before destructuring
  const { platform } = await params
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // FIX 3: cookies() must be awaited in Next.js 15
  const cookieStore = await cookies()
  const savedState = cookieStore.get("oauth_state")?.value

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/connections?error=${error}&platform=${platform}`, request.url))
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=invalid_state&platform=${platform}`, request.url),
    )
  }

  try {
    // In a real implementation, exchange the code for access token
    // const tokenResponse = await exchangeCodeForToken(platform, code)

    // For demo purposes, we'll simulate a successful connection
    const mockTokenResponse = {
      access_token: "mock_access_token_" + Math.random().toString(36).substring(7),
      refresh_token: "mock_refresh_token_" + Math.random().toString(36).substring(7),
      expires_in: 3600,
      username: `user_${Math.floor(Math.random() * 10000)}`,
    }

    // FIX 4: Use the cookieStore instance we awaited above
    cookieStore.set(`${platform}_access_token`, mockTokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: mockTokenResponse.expires_in,
      path: "/",
    })

    // Redirect back to connections page with success message
    return NextResponse.redirect(
      new URL(
        `/dashboard/connections?success=true&platform=${platform}&username=${mockTokenResponse.username}`,
        request.url,
      ),
    )
  } catch (err) {
    console.error("OAuth callback error:", err)
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=token_exchange_failed&platform=${platform}`, request.url),
    )
  }
}