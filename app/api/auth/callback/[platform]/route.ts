import { type NextRequest, NextResponse } from "next/server"
import { connectSocialAccount } from "@/lib/firebase/social-accounts"
import { auth } from "@/lib/firebase/config"

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const platform = params.platform
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Get the stored state from cookies
  const storedState = request.cookies.get("oauth_state")?.value

  // Check for errors or invalid state
  if (error || !code || !state || state !== storedState) {
    return NextResponse.redirect(new URL(`/dashboard/connections?error=${error || "invalid_request"}`, request.url))
  }

  try {
    // Get the current user
    const currentUser = auth.currentUser
    if (!currentUser) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Exchange code for access token and user info
    const tokenData = await exchangeCodeForToken(platform, code)

    // Connect the social account
    await connectSocialAccount(platform as any, {
      username: tokenData.username,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      profileUrl: tokenData.profileUrl,
      connected: true,
      connectedAt: new Date().toISOString(),
      followers: tokenData.followers || 0,
      followersGrowth: tokenData.followersGrowth || 0,
      engagement: tokenData.engagement || 0,
      posts: tokenData.posts || 0,
    })

    // Redirect back to connections page with success message
    return NextResponse.redirect(new URL("/dashboard/connections?success=true", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=${encodeURIComponent((error as Error).message)}`, request.url),
    )
  }
}

async function exchangeCodeForToken(platform: string, code: string) {
  // In a real implementation, these would make actual API calls to the respective platforms
  // For this example, we'll simulate successful responses

  switch (platform) {
    case "instagram":
      return {
        username: "instagram_user",
        accessToken: "mock_instagram_token",
        refreshToken: "mock_refresh_token",
        profileUrl: "https://instagram.com/instagram_user",
        followers: 1250,
        followersGrowth: 5.2,
        engagement: 3.8,
        posts: 42,
      }
    case "youtube":
      return {
        username: "youtube_channel",
        accessToken: "mock_youtube_token",
        refreshToken: "mock_refresh_token",
        profileUrl: "https://youtube.com/channel/youtube_channel",
        followers: 3500,
        followersGrowth: 2.7,
        engagement: 4.2,
        posts: 28,
      }
    case "tiktok":
      return {
        username: "tiktok_user",
        accessToken: "mock_tiktok_token",
        refreshToken: "mock_refresh_token",
        profileUrl: "https://tiktok.com/@tiktok_user",
        followers: 2800,
        followersGrowth: 8.5,
        engagement: 6.3,
        posts: 65,
      }
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
