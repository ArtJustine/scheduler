// Instagram OAuth Callback Route
import { NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"
import { cookies } from "next/headers"
import { instagramOAuth } from "@/lib/oauth-utils"
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
      console.error("Instagram OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/connections?error=instagram_auth_failed&message=${error}`, request.url))
    }

    // Validate state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    const userId = cookieStore.get("oauth_user_id")?.value
    const storedRedirectUri = cookieStore.get("oauth_redirect_uri")?.value

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=invalid_instagram_auth", request.url))
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard/connections?error=user_not_found", request.url))
    }

    // Exchange authorization code for access token
    const tokenData = await instagramOAuth.exchangeCodeForToken(code, storedRedirectUri)

    // Get user info from Instagram
    let username = "instagram_user"
    let profilePicture = null
    try {
      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=username,account_type&access_token=${tokenData.access_token}`
      )
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        username = userInfo.username || username
      }
    } catch (err) {
      console.warn("Could not fetch Instagram user info:", err)
    }

    // Save to Firestore
    if (serverDb) {
      const userDocRef = doc(serverDb, "users", userId)
      const userDoc = await getDoc(userDocRef)

      const accountData = {
        id: tokenData.user_id || userId,
        username,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        connectedAt: new Date().toISOString(),
        profilePicture,
      }

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          instagram: accountData,
          updatedAt: new Date().toISOString(),
        })
      } else {
        await setDoc(userDocRef, {
          instagram: accountData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // Clear OAuth cookies
    const response = NextResponse.redirect(new URL("/dashboard/connections?success=instagram_connected", request.url))
    response.cookies.delete("oauth_state")
    response.cookies.delete("oauth_user_id")
    response.cookies.delete("oauth_redirect_uri")

    return response
  } catch (error: any) {
    console.error("Instagram callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/connections?error=instagram_callback_failed&message=${encodeURIComponent(error.message)}`, request.url))
  }
}
