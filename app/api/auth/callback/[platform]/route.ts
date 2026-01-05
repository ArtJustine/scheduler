import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

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
    const mockTokenResponse = {
      access_token: "mock_access_token_" + Math.random().toString(36).substring(7),
      refresh_token: "mock_refresh_token_" + Math.random().toString(36).substring(7),
      expires_in: 3600,
      username: `user_${Math.floor(Math.random() * 10000)}`,
    }

    cookieStore.set(`${platform}_access_token`, mockTokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: mockTokenResponse.expires_in,
      path: "/",
    })

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
