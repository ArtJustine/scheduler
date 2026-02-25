// YouTube OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { youtubeOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("YouTube OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/connections?error=youtube_auth_failed&message=${error}`, request.url))
    }

    // Validate state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    const userId = cookieStore.get("oauth_user_id")?.value
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_youtube_auth", request.url))
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    // Exchange authorization code for access token
    const tokenData = await youtubeOAuth.exchangeCodeForToken(code, storedRedirectUri)

    // Get user info from YouTube
    let channelTitle = "YouTube Channel"
    let channelId = null
    let channelThumbnail = null
    let subscribers = 0
    let videos = 0
    let views = 0

    try {
      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      )
      if (channelResponse.ok) {
        const channelData = await channelResponse.json()
        if (channelData.items && channelData.items.length > 0) {
          const channel = channelData.items[0]
          channelTitle = channel.snippet.title
          channelId = channel.id
          channelThumbnail = channel.snippet.thumbnails?.high?.url ||
            channel.snippet.thumbnails?.medium?.url ||
            channel.snippet.thumbnails?.default?.url

          subscribers = parseInt(channel.statistics?.subscriberCount || "0")
          videos = parseInt(channel.statistics?.videoCount || "0")
          views = parseInt(channel.statistics?.viewCount || "0")
        }
      }
    } catch (err) {
      console.warn("Could not fetch YouTube channel info:", err)
    }

    // Prepare account data for handover
    const accountData = {
      platform: "youtube",
      id: channelId || userId,
      username: channelTitle,
      profileImage: channelThumbnail,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null,
      connectedAt: new Date().toISOString(),
      followers: subscribers,
      posts: videos,
      views: views,
      channelId,
      connected: true,
    }

    // Save to Firestore directly from the server using Admin SDK for bypass permissions
    try {
      const { adminDb } = await import("@/lib/firebase-admin")
      let workspaceId = cookieStore.get("oauth_workspace_id")?.value

      // If workspaceId is missing, try to find the user's active workspace
      if (!workspaceId && userId) {
        const userDoc = await adminDb.collection("users").doc(userId).get()
        if (userDoc.exists) {
          workspaceId = userDoc.data()?.activeWorkspaceId
        }
      }

      if (workspaceId) {
        // Save to workspace doc
        const workspaceDocRef = adminDb.collection("workspaces").doc(workspaceId)
        await workspaceDocRef.update({
          [`accounts.${accountData.platform}`]: {
            ...accountData,
            updatedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        })
        console.log("YouTube account saved to Workspace (Admin):", workspaceId)
      } else {
        // Legacy: Save to user doc
        const userDocRef = adminDb.collection("users").doc(userId)
        await userDocRef.set({
          youtube: {
            ...accountData,
            updatedAt: new Date().toISOString()
          }
        }, { merge: true })
        console.log("YouTube account saved to User Doc (Admin):", userId)
      }
    } catch (saveError) {
      console.error("Error saving YouTube account to Firestore (Admin):", saveError)
    }

    // Redirect to dashboard with handover flag
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=youtube_connected&handover=true", request.url))

    // Set handover cookie (short-lived, accessible by client)
    response.cookies.set("social_handover_data", JSON.stringify(accountData), {
      httpOnly: false, // Must be accessible by client-side JS
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "lax",
    })

    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("oauth_redirect_uri")
    response.cookies.delete("oauth_workspace_id")

    return response
  } catch (error: any) {
    console.error("YouTube callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/connections?error=youtube_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
  }
}
