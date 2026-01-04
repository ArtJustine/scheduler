// YouTube OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { youtubeOAuth, oauthHelpers } from "@/lib/oauth-utils"
import { cookies } from "next/headers"
import { serverDb } from "@/lib/firebase-server"
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("YouTube OAuth error:", error)
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=youtube_auth_failed&message=${error}`
      )
    }

    // Validate state
    const savedState = cookies().get("oauth_state")?.value
    const userId = cookies().get("oauth_user_id")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=invalid_youtube_auth`
      )
    }

    if (!userId) {
      return NextResponse.redirect(
        `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=user_not_found`
      )
    }

    // Exchange authorization code for access token
    const tokenData = await youtubeOAuth.exchangeCodeForToken(code)

    // Get user info from YouTube
    let channelTitle = "YouTube Channel"
    let channelId = null
    try {
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${tokenData.access_token}`
      )
      if (channelResponse.ok) {
        const channelData = await channelResponse.json()
        if (channelData.items && channelData.items.length > 0) {
          channelTitle = channelData.items[0].snippet.title
          channelId = channelData.items[0].id
        }
      }
    } catch (err) {
      console.warn("Could not fetch YouTube channel info:", err)
    }

    // Save to Firestore
    if (serverDb) {
      const userDocRef = doc(serverDb, "users", userId)
      const userDoc = await getDoc(userDocRef)

      const accountData = {
        id: channelId || userId,
        username: channelTitle,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        connectedAt: new Date().toISOString(),
        channelId,
      }

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          youtube: accountData,
          updatedAt: new Date().toISOString(),
        })
      } else {
        await setDoc(userDocRef, {
          youtube: accountData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?success=youtube_connected`
    )
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")

    return response
  } catch (error: any) {
    console.error("YouTube callback error:", error)
    return NextResponse.redirect(
      `${config.app.baseUrl || "http://localhost:3000"}/dashboard/connections?error=youtube_callback_failed&message=${error.message}`
    )
  }
}
