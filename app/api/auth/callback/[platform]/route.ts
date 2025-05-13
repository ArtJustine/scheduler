import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Verify state to prevent CSRF attacks
  const savedState = cookies().get("oauth_state")?.value

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

    // Store tokens in cookies or session (for demo only - in production use secure storage)
    cookies().set(`${platform}_access_token`, mockTokenResponse.access_token, {
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
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=token_exchange_failed&platform=${platform}`, request.url),
    )
  }
}
